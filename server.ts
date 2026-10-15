import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { getOfficialApkPackageBuffer } from './src/utils/apkGenerator.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '25mb' }));

// Shared Gemini client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function handleError(res: Response, error: unknown, fallbackMessage: string) {
  console.error('[Server Error]:', error);
  const message = error instanceof Error ? error.message : fallbackMessage;
  res.status(500).json({ error: message });
}

// -------------------------------------------------------------
// 1. AI Loan Eligibility & Underwriting Assessment
// Uses gemini-3.8-flash to evaluate risk and calculate recommended terms
// -------------------------------------------------------------
app.post('/api/assess-eligibility', async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      monthlyIncome,
      employmentType,
      requestedAmount,
      tenureMonths,
      existingEmi = 0,
      loanCategory,
      currencySymbol = '$',
    } = req.body;

    const income = Number(monthlyIncome) || 0;
    const loanAmt = Number(requestedAmount) || 0;
    const emiCommit = Number(existingEmi) || 0;
    const tenure = Number(tenureMonths) || 12;

    const prompt = `You are a senior credit underwriting officer at "N.S. LOAN & Finance".
Evaluate this loan application:
- Applicant: ${fullName}
- Employment: ${employmentType}
- Monthly Net Income: ${currencySymbol}${income}
- Existing Monthly Obligations: ${currencySymbol}${emiCommit}
- Requested Loan Type: ${loanCategory}
- Requested Loan Amount: ${currencySymbol}${loanAmt}
- Requested Tenure: ${tenure} months

Compute or estimate:
1. Debt-to-Income (DTI) ratio
2. Simulated Credit Score (range 300 - 850)
3. Loan Decision: ("APPROVED", "CONDITIONALLY_APPROVED", or "REFERRED")
4. Suggested Max Eligible Amount
5. Underwriter Summary: 2-3 sentences explaining the financial appraisal, risk assessment, and recommendation.
6. Recommended Interest Rate Range (e.g. 9.5% - 12.0%)

Return ONLY valid JSON in this exact structure:
{
  "decision": "APPROVED",
  "creditScore": 745,
  "dtiPercentage": 28.5,
  "maxEligibleAmount": ${Math.round(income * 18)},
  "recommendedInterestRate": 10.5,
  "riskRating": "LOW_RISK",
  "underwriterRemarks": "Applicant demonstrates strong disposable income with a healthy DTI ratio under 35%. Recommended for instant sanction.",
  "requiredDocumentNotes": ["Proof of Income (recent 3 months)", "Government Photo ID", "Utility Bill for Address Verification"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      // Fallback calculation
      const dti = income > 0 ? ((emiCommit + (loanAmt / tenure)) / income) * 100 : 50;
      const score = dti < 35 ? 760 : dti < 50 ? 690 : 610;
      result = {
        decision: dti < 50 ? 'APPROVED' : 'CONDITIONALLY_APPROVED',
        creditScore: score,
        dtiPercentage: Math.round(dti),
        maxEligibleAmount: Math.round(income * 15),
        recommendedInterestRate: 10.5,
        riskRating: dti < 40 ? 'LOW_RISK' : 'MODERATE_RISK',
        underwriterRemarks: `Application appraised with DTI of ${Math.round(dti)}%. Meets standard underwriting criteria.`,
        requiredDocumentNotes: ['National ID / Passport', 'Recent Salary Statements', 'Bank Statement (6 Months)'],
      };
    }

    res.json(result);
  } catch (error) {
    handleError(res, error, 'Failed to assess loan eligibility');
  }
});

// -------------------------------------------------------------
// 2. AI Financial & Loan Advisor Chat
// Answers questions about loan terms, documents, eligibility, and credit advice
// -------------------------------------------------------------
app.post('/api/loan-ai-advisor', async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemInstruction = `You are "NS Mobile & N.S. Loan Assistant", an expert, friendly consultant for "NS MOBILE SHOP & N.S. FINANCE".
Shop Details:
- Shop Name: NS MOBILE SHOP (NS MOBILE & N.S. FINANCE)
- Contact Number / Phone: 9332504150 (+91 9332504150)
- Location: Chanchal State, Garage er samne (Opposite garage), Chanchal, Malda, West Bengal, India
- Email: alinahid786455@gmail.com
- Shop Timings: 10:00 AM – 10:00 PM (Every day)
- Payments Accepted: India Bank Account & PhonePe (Number: 9332504150, UPI ID: 9332504150@ybl)

Products & Services:
- NS Mobile Smartphone & Device 0% EMI (Smartphones, iPhones, 5G Android phones on easy installments)
- Personal Cash Loans (10.5% p.a., same-day disbursement to Indian bank account or PhonePe)
- Business & Micro Cash Loans
- Mobile sales, accessories, and instant repair services

Key policies:
- Minimum age: 18+ years
- Fast 10-15 minute in-shop or online approval
- Documents needed: Aadhaar Card / Voter ID / PAN Card, PhonePe / Bank details
- Tone: Helpful, welcoming, respectful, and providing exact contact info (Phone: 9332504150, Chanchal State garage er samne).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      reply: response.text || 'N.S. LOAN provides flexible financing options tailored to your needs. How may I assist you today?',
    });
  } catch (error) {
    handleError(res, error, 'Failed to generate financial advice');
  }
});

// -------------------------------------------------------------
// 3. Direct Android APK Download & Info Endpoints
// Direct binary delivery for Android installation & side-loading
// -------------------------------------------------------------

app.get(['/download/NS_Mobile_Finance_v2.4.1.apk', '/api/download-apk', '/NS_Mobile_Finance_v2.4.1.apk', '/app-release.apk'], (_req: Request, res: Response) => {
  try {
    const apkBuffer = getOfficialApkPackageBuffer();
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="NS_Mobile_Finance_v2.4.1.apk"');
    res.setHeader('Content-Length', apkBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(apkBuffer);
  } catch (err) {
    handleError(res, err, 'Failed to serve APK');
  }
});

app.get('/api/apk-info', (req: Request, res: Response) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const downloadUrl = `${protocol}://${host}/download/NS_Mobile_Finance_v2.4.1.apk`;
  res.json({
    appName: 'NS Mobile Finance - Loan & EMI',
    packageName: 'com.nsmobile.customerapp',
    version: '2.4.1',
    buildNumber: 20401,
    fileSize: '24.8 MB',
    fileName: 'NS_Mobile_Finance_v2.4.1.apk',
    directDownloadUrl: downloadUrl,
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.nsmobile.customerapp',
  });
});

// -------------------------------------------------------------
// Vite middleware in dev or static files in production
// -------------------------------------------------------------
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }
}

setupVite().then(() => {
  server.listen(port, '0.0.0.0', () => {
    console.log(`N.S. LOAN server running on http://localhost:${port}`);
  });
});
