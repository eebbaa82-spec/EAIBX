# Research brief: Investopia regulations and research library (used every month)

Goal: a JSON list of documents for the category named in your task, saved at `/mnt/project-files/eabix/regulatory-library/data/<slug>.json`. Investors and business owners read these summaries on the Investopia website (Knowledge Hub > Regulations and research) and click through to the original.

## Source rule (strict)
Each entry is ONE official document, linked at its official home: nbe.gov.et, mofed.gov.et / mof.gov.et, investethiopia.gov.et, ecma.gov.et, the House of Peoples' Representatives or Federal Negarit Gazeta pages, other Ethiopian government sites, or documents.worldbank.org / openknowledge.worldbank.org / worldbank.org. No news sites, law-firm summaries, blogs or mirrors. If the official page cannot be opened, leave the document out (mention it in your final summary).

Open (WebFetch) every document page or PDF you list, and confirm: exact title, number, issuer, date issued or published, and that the link opens the document (or its official landing page). Summarize only from what you read. Do not guess article numbers or provisions.

## JSON schema
{
  "slug": "<given>",
  "name": "<given category title>",
  "intro": "1 to 2 sentences on what this category covers and why it matters to investors",
  "asOf": "<YYYY-MM-DD today>",
  "documents": [
    {
      "title": "official title",
      "number": "e.g. Directive No. SBB/89/2024, Proclamation No. 1180/2020, Policy Research Working Paper 10734 (empty string if none)",
      "issuer": "e.g. National Bank of Ethiopia",
      "date": "YYYY-MM-DD or YYYY-MM or YYYY",
      "status": "In force | Amended by ... | Draft | Repealed by ... | Published (research)",
      "topic": "short tag, e.g. Foreign exchange, Banking licensing, Tax, Incentives, PPP, Capital markets, Research",
      "summary": "2 to 4 plain US English sentences: what it does or finds",
      "relevance": "1 to 2 sentences: what it means for an investor or business in Ethiopia (for World Bank papers: relevance to the Ethiopian context)",
      "url": "direct link to the document (PDF preferred) or its official page",
      "accessed": "<today>"
    }
  ]
}
Newest and most important first. Aim for 10 to 20 documents; quality over count.

## Shared-folder rules
The folder is shared with other sessions. Write only your own `data/<slug>.json` (validate with `python3 -m json.tool`, read back after ~10 seconds). Do not edit other files. Do not install packages.

Return a short summary: documents listed, any important documents you could not open, any status you could not confirm.
