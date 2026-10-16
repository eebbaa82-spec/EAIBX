# Research brief for one sector (used every month)

Goal: a sourced fact file about investment opportunities in Ethiopia for the sector named in your task, saved as JSON at `/mnt/project-files/eabix/sector-reports/data/<slug>.json`.

## Source rule (strict)
Use ONLY documents or official web pages published by:
- international institutions: World Bank, IFC, MIGA, IMF, African Development Bank, UNCTAD, UNIDO, UNDP, FAO, IFAD, ILO, WTO/ITC, OECD, IEA, IRENA, EIB, the European Union, USAID/US government, UK FCDO, AfCFTA Secretariat, and similar public bodies;
- the Ethiopian government: Ethiopian Investment Commission (investethiopia.gov.et), National Bank of Ethiopia (nbe.gov.et), Ministry of Finance, Ministry of Planning and Development, line ministries (Agriculture, Industry, Mines, Water and Energy, Innovation and Technology, Tourism, Health, Trade), Ethiopian Statistical Service, Ethiopian Capital Market Authority, Ethiopian Securities Exchange, Industrial Parks Development Corporation, Ethiopian Electric Power, Ethiopian News Agency (state agency; only for government statements).
Not allowed: news sites, blogs, consultancies, banks' marketing, Wikipedia, your own estimates.

Open (WebFetch) every page or PDF you take a figure from. A search snippet is not a source. Copy figures exactly, with their unit, period and the page/section where they appear. Prefer the most recent edition (2024 to 2026). Never compute, average or extrapolate a figure yourself, with ONE exception: none.

## Returns (most important)
`returns` holds only figures a permitted source itself publishes about returns, profitability or yields that bear on this sector: e.g. stated ROI, IRR, payback period, gross margins, return on equity, tariff or offtake yields, lending rates to the sector, Treasury bill yields (benchmark). If no permitted source publishes a return figure for the sector, leave `returns` empty and write in `returnsNote` exactly: "No international institution or Ethiopian government source we reviewed publishes an average return on investment for this sector." followed by one sentence naming the closest published indicators you did include.

## JSON schema
{
  "slug": "<given>",
  "name": "<given>",
  "asOf": "<YYYY-MM-DD today>",
  "summary": "2 to 3 plain sentences, US English, on why the sector matters for investors, every claim sourced below",
  "indicators": [{"label": "...", "value": "...", "period": "...", "source": "S1"}],
  "returns": [{"label": "...", "value": "...", "period": "...", "basis": "what exactly the source measures", "source": "S2"}],
  "returnsNote": "...",
  "opportunities": [{"title": "short", "detail": "1 to 2 sentences", "source": "S3"}],
  "incentives": [{"detail": "...", "source": "S4"}],
  "risks": [{"detail": "...", "source": "S5"}],
  "sources": [{"id": "S1", "title": "...", "publisher": "...", "date": "YYYY or YYYY-MM", "url": "...", "location": "page/section", "accessed": "<today>"}]
}
Aim for 4 to 8 indicators, 3 to 6 opportunities, 2 to 5 incentives, 2 to 5 risks. Fewer is fine when sources are thin; never pad. US English.

## Shared-folder rules
The folder is shared with other sessions. Write only your own `data/<slug>.json` files (write each once, complete; validate with `python3 -m json.tool`). Do not edit other files. Do not install packages. Read the file back ~10 seconds after writing to confirm it saved.

Return a short summary: sectors done, number of sources, whether a published return figure was found, and any gaps.
