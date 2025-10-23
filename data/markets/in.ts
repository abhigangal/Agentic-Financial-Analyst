



import { GoogleGenAI } from "@google/genai";
import { StockCategory, MarketConfig, Expert } from '../../types';

// This logic is moved from geminiService.ts and adapted for this specific market.
const validateYahooInSymbol = async (symbol: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Assume symbol is already correctly formatted (e.g., ends with .NS)
    const urlToCheck = `https://finance.yahoo.com/quote/${symbol.toUpperCase()}`;
    const contents = `URL: ${urlToCheck}. Is this a valid Yahoo Finance page for a publicly traded stock? Answer ONLY "YES" or "NO".`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        temperature: 0,
        tools: [{googleSearch: {}}],
      },
    });

    return response.text.trim().toUpperCase().startsWith('YES');
  } catch (error) {
    console.error(`Error validating symbol ${symbol} on Yahoo Finance:`, error);
    return false;
  }
};

const experts: Expert[] = [
  // Tier 1
  {
    name: "Raamdeo Agrawal",
    tier: 1,
    description: "As the Chairman of Motilal Oswal Financial Services, he is one of India's most respected fundamental and value investors. His 'Wealth Creation Studies' and long-term investment philosophy make him a guru for serious, long-term investors.",
  },
  {
    name: "Sandeep Wagle",
    tier: 1,
    description: "A veteran technical analyst with over 25 years of experience, Sandeep Wagle is a common face on business television. His technical research is highly followed for a combination of short-term trading calls and mid-to-long-term positional views.",
  },
  {
    name: "Kunal Bothra",
    tier: 1,
    description: "A prominent SEBI-registered technical analyst and a regular contributor to major financial publications. His well-articulated, often 'bold' technical calls on indices and individual stocks make him a go-to for many traders.",
  },
  // Tier 2
  {
    name: "Sumeet Bagadia",
    tier: 2,
    description: "As the Executive Director of Technical Research at Choice Broking, he is a prominent figure on business channels. His recommendations are highly regarded for their specific targets and stop-loss levels, making them practical for traders.",
  },
  {
    name: "Gaurang Shah",
    tier: 2,
    description: "He is an Associate Director and Senior Technical Analyst at Geojit Financial Services. Known for his concise and actionable views, he is a frequent guest on CNBC Awaaz and other channels.",
  },
  {
    name: "Rajesh Satpute",
    tier: 2,
    description: "A highly respected technical and derivatives analyst with over two decades of experience. He is known as 'Circuit Guru' on CNBC Awaaz and his expertise is highly valued.",
  },
  // Tier 3
  {
    name: "Vijay Kedia",
    tier: 3,
    description: "A veteran investor known for his focus on small-cap companies and his unique 'SMILE' philosophy. He is a great source of inspiration for investors looking for multi-bagger stocks.",
  },
  {
    name: "Rachana Phadke Ranade",
    tier: 3,
    description: "A chartered accountant turned finance educator with a massive online following. While not an analyst in the traditional sense, her educational content is widely used by retail investors to make their own decisions.",
  },
  {
    name: "Pranjal Kamra",
    tier: 3,
    description: "The founder of Finology, he is known for his in-depth tutorials on equity investing and long-term wealth-building strategies. He appeals to a younger demographic looking for structured financial education.",
  },
];


const stockCategories: StockCategory[] = [
  {
    "name": "Banking",
    "symbols": ["HDFCBANK.NS", "ICICIBANK.NS", "KOTAKBANK.NS", "AXISBANK.NS", "INDUSINDBK.NS", "IDFCFIRSTB.NS", "FEDERALBNK.NS", "AUBANK.NS", "BANDHANBNK.NS", "RBLBANK.NS", "YESBANK.NS", "KTKBANK.NS"],
    "description": "This category includes private sector banks providing a wide range of financial services, including retail banking, corporate banking, investment banking, and wealth management.",
    "key_influencers": [
      "RBI Monetary Policy (interest rates, repo rate)",
      "Economic growth and credit demand",
      "Asset quality (NPA levels)",
      "Regulatory changes (e.g., capital adequacy norms)",
      "Digital adoption and financial inclusion"
    ]
  },
  {
    "name": "PSU Banks",
    "symbols": ["SBIN.NS", "BANKBARODA.NS", "PNB.NS", "CANBK.NS", "UNIONBANK.NS", "INDIANB.NS", "BANKINDIA.NS", "IOB.NS", "CENTRALBK.NS", "UCOBANK.NS"],
    "description": "Public Sector Undertaking (PSU) Banks are majority-owned by the Government of India, playing a crucial role in financial inclusion and implementing government schemes.",
    "key_influencers": [
      "Government policies and recapitalization efforts",
      "RBI Monetary Policy (interest rates, repo rate)",
      "Asset quality and bad loan resolution",
      "Mergers and consolidation initiatives",
      "Rural and agricultural credit demand"
    ]
  },
  {
    "name": "IT",
    "symbols": ["TCS.NS", "INFY.NS", "HCLTECH.NS", "WIPRO.NS", "LTIM.NS", "TECHM.NS", "PERSISTENT.NS", "COFORGE.NS", "MPHASIS.NS", "TATAELXSI.NS", "KPITTECH.NS", "LTTS.NS", "OFSS.NS", "NEWGEN.NS", "HAPPSTMNDS.NS"],
    "description": "The Indian IT sector comprises companies providing software development, IT services, consulting, and BPO services globally, a major export-driven industry.",
    "key_influencers": [
      "Global economic growth and IT spending",
      "Currency exchange rates (INR vs USD)",
      "Technological advancements (AI, cloud, cybersecurity)",
      "Talent availability and attrition rates",
      "Client deal wins and project pipelines"
    ]
  },
  {
    "name": "Pharma",
    "symbols": ["SUNPHARMA.NS", "CIPLA.NS", "DRREDDY.NS", "DIVISLAB.NS", "APOLLOHOSP.NS", "LUPIN.NS", "AUROPHARMA.NS", "ALKEM.NS", "BIOCON.NS", "TORNTPHARM.NS", "GLENMARK.NS", "ZYDUSLIFE.NS"],
    "description": "This sector includes companies engaged in the research, development, manufacturing, and marketing of pharmaceutical drugs and healthcare products, both for domestic and international markets.",
    "key_influencers": [
      "Drug discovery and R&D success",
      "Regulatory approvals and compliance (USFDA, Indian regulations)",
      "Patent expirations and generic competition",
      "Government healthcare policies and pricing controls",
      "Global health trends and disease burden"
    ]
  },
  {
    "name": "FMCG",
    "symbols": ["HINDUNILVR.NS", "ITC.NS", "NESTLEIND.NS", "BRITANNIA.NS", "DABUR.NS", "GODREJCP.NS", "MARICO.NS", "COLPAL.NS", "UBL.NS", "PGHH.NS", "EMAMILTD.NS", "VBL.NS", "BAJAJCON.NS"],
    "description": "Fast-Moving Consumer Goods (FMCG) companies produce and market non-durable goods that are frequently purchased by consumers, such as food, beverages, personal care, and household products.",
    "key_influencers": [
      "Consumer spending and disposable income",
      "Inflation and raw material prices",
      "Monsoon and agricultural income (especially rural demand)",
      "Competitive landscape and advertising spend",
      "Distribution network strength and e-commerce penetration"
    ]
  },
  {
    "name": "Auto",
    "symbols": ["MARUTI.NS", "TATAMOTORS.NS", "M&M.NS", "BAJAJ-AUTO.NS", "HEROMOTOCO.NS", "EICHERMOT.NS", "TVSMOTOR.NS", "ASHOKLEY.NS", "BOSCHLTD.NS", "BHARATFORG.NS", "SONACOMS.NS", "MOTHERSUMI.NS", "ATULAUTO.NS"],
    "description": "The Automotive sector includes manufacturers of passenger vehicles, commercial vehicles, two-wheelers, and auto components, catering to both domestic and export markets.",
    "key_influencers": [
      "Economic growth and consumer sentiment",
      "Fuel prices and interest rates",
      "Government policies (e.g., FAME India, emission norms)",
      "Raw material costs (steel, aluminum)",
      "Transition to Electric Vehicles (EVs) and charging infrastructure"
    ]
  },
  {
    "name": "Energy",
    "symbols": ["RELIANCE.NS", "ADANIENT.NS", "ADANIGREEN.NS", "TATAPOWER.NS", "NTPC.NS", "POWERGRID.NS", "ONGC.NS", "COALINDIA.NS", "ADANIPORTS.NS", "GAIL.NS", "IEX.NS", "BPCL.NS", "IOC.NS", "HAL.NS", "INOXWIND.NS"],
    "description": "This sector encompasses companies involved in exploration, production, refining, distribution of oil & gas, coal mining, power generation, transmission, and renewable energy.",
    "key_influencers": [
      "Global crude oil and commodity prices",
      "Government energy policies and subsidies",
      "Renewable energy targets and investments",
      "Regulatory frameworks for power and gas distribution",
      "Geopolitical events affecting supply chains"
    ]
  },
  {
    "name": "Metal",
    "symbols": ["TATASTEEL.NS", "JSWSTEEL.NS", "HINDALCO.NS", "VEDL.NS", "JINDALSTEL.NS", "SAIL.NS", "HINDZINC.NS", "NMDC.NS", "APLAPOLLO.NS"],
    "description": "The Metal sector comprises companies involved in mining, processing, and manufacturing of various metals like steel, aluminum, copper, and zinc.",
    "key_influencers": [
      "Global commodity prices (iron ore, coal, base metals)",
      "Demand from user industries (auto, construction, infrastructure)",
      "Import/export duties and trade policies",
      "Environmental regulations and production costs",
      "Global economic cycles and industrial production"
    ]
  },
  {
    "name": "Fin Service",
    "symbols": ["BAJFINANCE.NS", "BAJAJFINSV.NS", "JIOFIN.NS", "CHOLAFIN.NS", "SBICARD.NS", "MUTHOOTFIN.NS", "ICICIGI.NS", "BAJAJHLDNG.NS", "HDFCAMC.NS", "ANGELONE.NS", "CDSL.NS", "MCX.NS", "CAMS.NS", "POLICYBZR.NS", "PEL.NS", "BSE.NS"],
    "description": "This broad sector includes non-banking financial companies (NBFCs), housing finance, asset management companies, broking, exchanges, and other financial intermediaries.",
    "key_influencers": [
      "RBI policies and interest rate movements",
      "Credit demand and economic activity",
      "Regulatory changes for NBFCs and market infrastructure",
      "Digitalization of financial transactions and fintech competition",
      "Investor participation in capital markets"
    ]
  },
  {
    "name": "Insurance",
    "symbols": ["HDFCLIFE.NS", "SBILIFE.NS", "ICICIPRULI.NS", "BAJAJFINSV.NS", "ICICIGI.NS", "NIACL.NS", "GICRE.NS", "NEWINDIA.NS", "STARHEALTH.NS"],
    "description": "Companies offering life, health, and general insurance products, generating revenue from premiums and investments. This sector benefits from rising awareness and increasing disposable incomes.",
    "key_influencers": [
      "Regulatory environment (IRDAI norms, solvency ratios)",
      "Interest rate movements (impact on investment income)",
      "Demographic trends (aging population, life expectancy)",
      "Awareness and penetration of insurance products",
      "Technological adoption for underwriting and claims"
    ]
  },
  {
    "name": "Realty",
    "symbols": ["DLF.NS", "GODREJPROP.NS", "OBEROIRLTY.NS", "PHOENIXLTD.NS", "PRESTIGE.NS", "LODHA.NS", "BRIGADE.NS", "SOBHA.NS", "MAHLIFE.NS"],
    "description": "Real estate companies involved in property development, construction, and management of residential, commercial, and retail projects.",
    "key_influencers": [
      "Interest rates and home loan availability",
      "Urbanization and population growth",
      "Government policies (RERA, affordable housing schemes)",
      "Raw material costs (cement, steel, labor)",
      "Consumer confidence and purchasing power"
    ]
  },
  {
    "name": "Chemicals",
    "symbols": ["PIDILITIND.NS", "SRF.NS", "UPL.NS", "ASIANPAINT.NS", "BERGEPAINT.NS", "DEEPAKNTR.NS", "AARTIIND.NS", "VINATIORGA.NS", "SOLARINDS.NS", "PIIND.NS", "ATUL.NS", "GUJFLUORO.NS"],
    "description": "Manufacturers of specialty chemicals, petrochemicals, agrochemicals, and other industrial chemicals used as raw materials across various industries.",
    "key_influencers": [
      "Raw material prices (crude oil derivatives)",
      "Demand from user industries (textiles, auto, pharma, agriculture)",
      "Environmental regulations and compliance",
      "Global supply chain disruptions and geopolitical factors",
      "Government initiatives like 'Make in India' and PLI schemes"
    ]
  },
  {
    "name": "Infrastructure",
    "symbols": ["LT.NS", "ADANIPORTS.NS", "GMRINFRA.NS", "IRCTC.NS", "ULTRACEMCO.NS", "GRASIM.NS", "SIEMENS.NS", "ABB.NS", "IRFC.NS", "NCC.NS", "PNCINFRA.NS", "KEC.NS"],
    "description": "Companies involved in the development and maintenance of essential public facilities like roads, bridges, railways, ports, airports, and power plants. (Note: Some symbols overlap with Energy/Cement as they are diversified conglomerates)",
    "key_influencers": [
      "Government spending and infrastructure project pipeline",
      "Economic growth and industrial activity",
      "Policy stability and ease of doing business",
      "Interest rates and access to financing",
      "Environmental and land acquisition regulations"
    ]
  },
  {
    "name": "Consumer Durables",
    "symbols": ["TITAN.NS", "HAVELLS.NS", "VOLTAS.NS", "DIXON.NS", "WHIRLPOOL.NS", "CROMPTON.NS", "RELAXO.NS", "BLUESTAR.NS", "SYMPHONY.NS"],
    "description": "Manufacturers of long-lasting goods for household use, such as home appliances, electronics, and kitchen equipment, driven by rising disposable incomes and changing lifestyles.",
    "key_influencers": [
      "Consumer discretionary spending and income growth",
      "Urbanization and rising middle-class aspirations",
      "Technological advancements and product innovation",
      "Raw material costs and import duties",
      "E-commerce growth and distribution reach"
    ]
  },
  {
    "name": "Media & Entertainment",
    "symbols": ["ZEEL.NS", "SUNTV.NS", "PVRINOX.NS", "NETWORK18.NS", "TV18BRDCST.NS", "SAREGAMA.NS", "NAZARA.NS", "DBCORP.NS"],
    "description": "This sector includes television broadcasting, film production and distribution, streaming services, music, publishing, and advertising.",
    "key_influencers": [
      "Advertising revenue trends (linked to economic health)",
      "Digital transformation and OTT platform growth",
      "Content quality, diversity, and intellectual property rights",
      "Regulatory environment (censorship, foreign investment limits)",
      "Consumer preferences and shift in content consumption"
    ]
  },
  {
    "name": "Telecom",
    "symbols": ["BHARTIARTL.NS", "IDEA.NS", "INDUSTOWER.NS", "TEJASNET.NS", "RAILTEL.NS"],
    "description": "Companies providing telecommunication services, including mobile, broadband, enterprise solutions, and telecom infrastructure.",
    "key_influencers": [
      "Subscriber growth and data consumption",
      "Spectrum auctions and regulatory policies",
      "Competitive intensity and ARPU (Average Revenue Per User)",
      "5G rollout and infrastructure investments",
      "Debt levels and financial health of operators"
    ]
  },
  {
    "name": "Healthcare Services",
    "symbols": ["APOLLOHOSP.NS", "FORTIS.NS", "MAXHEALTH.NS", "LALPATHLAB.NS", "DRLAL.NS", "METROPOLIS.NS"],
    "description": "Providers of medical services through hospitals, clinics, diagnostic chains, and health insurance. This sector benefits from increasing awareness, income levels, and a growing need for financial protection.",
    "key_influencers": [
      "Healthcare expenditure and insurance penetration",
      "Government healthcare policies and public health initiatives",
      "Medical tourism trends",
      "Prevalence of lifestyle diseases and aging population",
      "Technological advancements in diagnostics and treatment"
    ]
  },
  {
    "name": "Capital Goods",
    "symbols": ["SIEMENS.NS", "ABB.NS", "CUMMINSIND.NS", "BHEL.NS", "GRAPHITE.NS", "HEG.NS"],
    "description": "Companies manufacturing machinery, equipment, and tools used by other industries to produce goods and services. They are crucial for industrial production and infrastructure development.",
    "key_influencers": [
      "Industrial capex (capital expenditure) cycle",
      "Economic growth and manufacturing output",
      "Government's 'Make in India' initiative",
      "Raw material costs and supply chain stability",
      "Technological advancements (automation, robotics)"
    ]
  },
  {
    "name": "Cement",
    "symbols": ["ULTRACEMCO.NS", "GRASIM.NS", "SHREECEM.NS", "ACC.NS", "AMBUJACEM.NS", "DALBHARAT.NS"],
    "description": "Producers and distributors of cement, a fundamental component in concrete, essential for construction and infrastructure projects.",
    "key_influencers": [
      "Construction activity and infrastructure spending",
      "Urbanization and housing demand",
      "Raw material costs (limestone, coal) and freight charges",
      "Energy costs and environmental regulations",
      "Regional demand variations and competitive pricing"
    ]
  },
  {
    "name": "Textiles",
    "symbols": ["ARVIND.NS", "RELIANCE.NS", "PAGEIND.NS", "KAJARIACER.NS", "WELSPUNIND.NS", "TRIDENT.NS", "ABFRL.NS"],
    "description": "Companies involved in textile manufacturing, apparel production, and home furnishings. (Note: Reliance is a conglomerate with textile interests).",
    "key_influencers": [
      "Consumer fashion trends and discretionary spending",
      "Raw material prices (cotton, synthetic fibers)",
      "Export demand and global trade policies",
      "Labor costs and manufacturing efficiency",
      "Government incentives and schemes for the textile industry"
    ]
  },
  {
    "name": "Logistics",
    "symbols": ["ALLCARGO.NS", "MAHLOG.NS", "CONCOR.NS", "VRL.NS", "GATI.NS", "DELHIVERY.NS"],
    "description": "Providers of services such as transportation, warehousing, freight forwarding, and supply chain solutions, crucial for the seamless movement of goods.",
    "key_influencers": [
      "Economic growth and industrial output",
      "E-commerce growth and last-mile delivery demand",
      "Fuel prices and transportation costs",
      "Infrastructure development (roads, ports, railways)",
      "National Logistics Policy (NLP) and regulatory reforms"
    ]
  },
  {
    "name": "Utilities",
    "symbols": ["NTPC.NS", "POWERGRID.NS", "GAIL.NS", "ADANITRANS.NS", "JSWENERGY.NS"],
    "description": "Companies involved in essential services like power generation, transmission, distribution, gas distribution, and water utilities. Often characterized by stable demand and regulatory oversight.",
    "key_influencers": [
      "Government power and energy policies",
      "Fuel availability and prices (coal, gas)",
      "Regulatory tariffs and reforms",
      "Infrastructure development for transmission and distribution",
      "Shift towards renewable energy sources"
    ]
  },
  {
    "name": "Construction Materials",
    "symbols": ["ASIANPAINT.NS", "PIDILITIND.NS", "CERA.NS", "HSIL.NS", "KAJARIACER.NS"],
    "description": "Producers of construction and building materials other than cement, such as paints, adhesives, ceramics, and sanitaryware.",
    "key_influencers": [
      "Real estate and construction sector growth",
      "Housing renovation and refurbishment trends",
      "Raw material costs (petrochemicals, pigments)",
      "Consumer preferences and brand loyalty",
      "Distribution network and dealer relationships"
    ]
  },
  {
    "name": "Hotels & Leisure",
    "symbols": ["INDIANHOTEL.NS", "EIH.NS", "CHALET.NS", "TAJGVK.NS", "LEMONTREE.NS", "BLISSGVS.NS", "EASEMYTRIP.NS"],
    "description": "Companies operating hotels, resorts, and providing other hospitality and leisure services, benefiting from business and tourism travel.",
    "key_influencers": [
      "Economic growth and discretionary spending",
      "Business and leisure travel trends (both domestic and international)",
      "Average Room Rates (ARR) and Occupancy Rates",
      "Government tourism policies and initiatives",
      "Geopolitical stability and health crises"
    ]

  },
  {
    "name": "Education",
    "symbols": ["CAREERP.NS", "CLEDUCATE.NS"],
    "description": "Companies providing educational services, including test preparation, vocational training, and online learning platforms.",
    "key_influencers": [
      "Demographics and demand for quality education",
      "Government education policies and regulations",
      "Technological advancements in ed-tech",
      "Competitive intensity in the coaching industry",
      "Student enrollment trends and disposable income"
    ]
  },
  {
    "name": "Defence",
    "symbols": ["HAL.NS", "BEL.NS", "BDL.NS", "COCHINSHIP.NS"],
    "description": "Companies manufacturing defense equipment, aerospace technology, and providing services for the armed forces, largely driven by government contracts.",
    "key_influencers": [
      "Government defense budget and procurement policies",
      "Geopolitical tensions and national security priorities",
      "'Make in India' in defense and indigenization focus",
      "Technology transfer agreements and international collaborations",
      "Export opportunities to other countries"
    ]
  },
  {
    "name": "Fertilizers & Pesticides",
    "symbols": ["FACT.NS", "GNFC.NS", "CHAMBLFERT.NS", "DEEPAKFERT.NS", "ZUARIAGRO.NS", "RALLIS.NS"],
    "description": "Manufacturers of agricultural inputs like fertilizers and pesticides, crucial for crop yield and food production.",
    "key_influencers": [
      "Monsoon patterns and agricultural output",
      "Government subsidy policies on fertilizers",
      "Raw material prices (natural gas, phosphoric acid)",
      "Minimum Support Prices (MSP) for crops",
      "Global demand and supply of agricultural commodities"
    ]

  },
  {
    "name": "Aviation",
    "symbols": ["INDIGO.NS", "SPICEJET.NS"],
    "description": "Airlines providing passenger and cargo air transport services, a highly competitive and cyclical industry.",
    "key_influencers": [
      "Aviation Turbine Fuel (ATF) prices",
      "Passenger traffic growth and load factors",
      "Currency exchange rates (INR vs USD) for lease payments",
      "Competitive intensity and pricing wars",
      "Government aviation policies and airport infrastructure"
    ]
  },
  {
    "name": "Jewellery & Watch",
    "symbols": ["TITAN.NS", "KALYANKJIL.NS", "RAJESHEXPO.NS"],
    "description": "Companies engaged in the manufacturing and retail of jewellery, watches, and other luxury accessories.",
    "key_influencers": [
      "Gold prices and consumer demand during wedding/festival seasons",
      "Consumer discretionary spending and income levels",
      "Hallmarking regulations and industry formalization",
      "Import duties on gold and other raw materials",
      "Shifting consumer preferences towards branded jewellery"
    ]
  }
];

export const inMarketConfig: MarketConfig = {
    id: 'IN',
    name: 'India',
    screenerName: 'Yahoo Finance',
    screenerUrlTemplate: 'https://finance.yahoo.com/quote/{symbol}',
    validateSymbol: validateYahooInSymbol,
    stockCategories: stockCategories,
    experts: experts,
    currencySymbol: '₹',
};