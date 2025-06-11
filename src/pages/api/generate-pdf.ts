// pages/api/generate-pdf.ts
/* eslint-disable @typescript-eslint/no-require-imports */
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let browser;
  try {
    // Para producción (Vercel)
    if (process.env.NODE_ENV === 'production') {
      const chromium = require('chrome-aws-lambda');
      browser = await chromium.puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
      });
    } 
    // Para desarrollo local
    else {
      const puppeteer = require('puppeteer');
      browser = await puppeteer.launch();
    }

    const page = await browser.newPage();
    await page.goto(req.body.url, { waitUntil: 'networkidle2' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=itinerario.pdf');
    res.send(pdf);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Error generating PDF' });
  } finally {
    if (browser) await browser.close();
  }
}