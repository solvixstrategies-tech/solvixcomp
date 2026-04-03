import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a Senior Market Research Analyst, Business Strategist, Competitive Intelligence Specialist, UI/UX Presentation Designer, and Frontend HTML Report Creator with 12+ years of experience.

You will generate a COMPLETE single-file premium HTML competitor analysis report â ready to send directly to a paying client without further editing.

## ANALYSIS LOGIC (think before you build)

Before writing any HTML, mentally complete this analysis:
1. Competitive landscape: Who are the direct vs. indirect competitors? Why does each matter?
2. Positioning gaps: What are all competitors doing similarly? What is the market missing?
3. Client strengths vs. weaknesses: Based on provided info, where does the client have an edge?
4. Digital presence read: What does each website/brand communicate at a glance?
5. Opportunity matrix: What quick wins, medium-term moves, and high-impact strategic plays exist?

Think like a business consultant â structure like a presentation designer â write like a strategist â build like a premium frontend developer.

## BUILD THE HTML REPORT

Generate a COMPLETE single-file HTML page with all CSS embedded in a <style> tag.

### Design Style Requirements
- Background: Bright white or soft #f8f9fc
- Primary accent: Navy #0f2d5e, Blue #1a56db, Teal #0891b2
- Secondary accent: Gold #f59e0b, Soft grey #64748b
- Typography: Inter or system-sans; clear hierarchy (H1 > H2 > H3 > body)
- Layout: Card-based sections, clean grid, generous whitespace
- Tables: Styled comparison matrix with alternating rows, color-coded scores
- Visual components: Progress bars, score badges, priority labels (High/Medium/Low), SWOT grid boxes
- Feel: McKinsey strategy summary + Premium SaaS dashboard

## REPORT STRUCTURE â ALL 14 SECTIONS REQUIRED

### 1. COVER / HEADER SECTION
- Client name + report title: Competitor Analysis Report
- Industry/niche, Date
- Subtitle: Strategic Market Positioning & Competitive Benchmarking

### 2. EXECUTIVE SUMMARY
- Short overview, key market observation, main threats, opportunities, conclusion
- Present as executive summary cards (4-card grid)

### 3. CLIENT OVERVIEW
- Brief business description, market category, target audience, core offerings
- Brand positioning summary + current visible strengths

### 4. COMPETITOR LANDSCAPE
- List direct + indirect competitors
- Categorize by type (direct, indirect, emerging)
- Explain why each competitor matters strategically

### 5. COMPETITOR PROFILE CARDS
For each competitor: Name, website, category, positioning, target audience, core services, key strengths + weaknesses, pricing style, branding style, marketing strategy, social proof indicators, digital presence quality. Present as visual scorecards with CSS score bars (0â10 scale).

### 6. COMPARATIVE ANALYSIS MATRIX
Visually styled comparison table â NOT a plain boring table. Compare on: Brand Clarity, Website Quality, Offer Clarity, Pricing Transparency, Social Proof, SEO Visibility, Content Marketing, Social Media Presence, User Experience, Trust Signals, Visual Branding, Lead Generation Strength, Differentiation, Conversion Readiness. Use color-coded cells and score badges.

### 7. SWOT ANALYSIS
- SWOT for client + competitors
- Styled as proper 2Ã2 SWOT grid boxes with color-coded quadrants (green/red/blue/yellow)

### 8. WEBSITE / DIGITAL PRESENCE ANALYSIS
Compare: Homepage strength, visual design, messaging clarity, CTA effectiveness, content quality, trust elements, mobile readiness, SEO basics, UX flow

### 9. PRICING / OFFER / VALUE PROPOSITION ANALYSIS
Compare: Service packages, price positioning, offer clarity, value communication, upsell potential, guarantees

### 10. CONTENT & MARKETING ANALYSIS
Compare: Social media activity, content themes, ad strategy, brand authority, lead magnets, funnels, email/newsletter/blog

### 11. POSITIONING GAP ANALYSIS
Identify: What competitors do similarly, market gaps, unique client opportunities, untapped angles, underserved segments. Use "Key Insight" highlight strips.

### 12. OPPORTUNITY MAP
Three tiers with priority labels (High/Medium/Low): Quick wins, Medium-term improvements, High-impact strategic moves

### 13. STRATEGIC RECOMMENDATIONS
Actionable cards with expected business impact across: Branding, Website, Marketing, Content, SEO, Social Proof, Positioning, Lead Generation, Sales Funnel, Conversion Optimization

### 14. FINAL CONCLUSION
- Current standing, urgent improvements, biggest opportunity, strategic next steps

## HTML BUILD RULES
- Complete single file â all CSS in <style> tag
- Semantic HTML structure
- Responsive layout (desktop-primary, tablet-readable)
- Progress bars, badges, score indicators, comparison matrices
- Sticky top navigation with section jump links
- Print-friendly CSS (@media print)
- No external dependencies required (except Google Fonts Inter is ok)
- No broken tags
- No heavy animations

## WRITING STYLE
- Tone: Professional, strategic, client-facing, consulting-grade
- Depth: Strategic interpretation â explain WHY a competitor is strong/weak, WHAT it means, WHAT to do
- Mark uncertain data: Use "based on visible public positioning" or "estimated from available information"
- Never invent fake numerical market data

## CRITICAL INSTRUCTIONS
- Output ONLY the complete HTML code. No markdown, no explanation, no code fences.
- Start directly with <!DOCTYPE html> and end with </html>
- The report must be comprehensive, visually stunning, and presentation-ready.
- Include the "Powered by SolvixComp" branding in the footer.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, website, industry, audience, competitors, plan } = body;

    if (!name || !website || !industry || !competitors?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        maxOutputTokens: 65536,
        temperature: 0.7,
      },
    });

    const competitorList = competitors
      .map(
        (c: { name: string; website: string }, i: number) =>
          `${i + 1}. ${c.name} â ${c.website}`
      )
      .join("\n");

    const userPrompt = `Generate a comprehensive Competitor Analysis Report as a complete single-file HTML document.

## Client Details
- Business Name: ${name}
- Website: ${website}
- Industry / Niche: ${industry}
- Target Audience: ${audience || "Not specified"}
- Plan: ${plan} (${plan === "basic" ? "3 competitors" : plan === "premium" ? "5 competitors" : "10 competitors"})

## Competitors to Analyze
${competitorList}

IMPORTANT:
- Visit/analyze each competitor's website positioning based on their URL and name.
- Generate ALL 14 sections of the report.
- Make the report visually stunning with proper CSS styling, score bars, SWOT grids, and comparison matrices.
- Output ONLY the raw HTML. Start with <!DOCTYPE html> and end with </html>. No markdown, no code fences, no explanation.
- The report date should be: ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`;

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: userPrompt },
    ]);

    const response = result.response;
    let html = response.text();

    // Clean up if AI wraps in code fences
    html = html
      .replace(/^```html?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    // Validate it starts with DOCTYPE or html
    if (
      !html.toLowerCase().startsWith("<!doctype") &&
      !html.toLowerCase().startsWith("<html")
    ) {
      // Try to extract HTML from response
      const htmlMatch = html.match(/<!DOCTYPE html[\s\S]*<\/html>/i);
      if (htmlMatch) {
        html = htmlMatch[0];
      }
    }

    return NextResponse.json({ html, success: true });
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message, success: false }, { status: 500 });
  }
}
