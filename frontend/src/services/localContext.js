/**
 * localContext.js
 *
 * ILLUSTRATIVE / DEMO CONTENT - NOT VERIFIED HEALTHCARE GUIDANCE.
 *
 * A lookup table mapping common genetic-risk conditions to locally relevant
 * next steps for users in India, with specific references to Kerala.
 * Government scheme names and institution names are real, but details
 * change - always verify directly with the relevant provider.
 *
 * DEMO DATA - replace entries with verified, up-to-date guidance from
 * the relevant state health department before going live.
 */

// ----------------------------------------------------------------------------
// DEMO DATA - illustrative only. Do NOT present as verified medical advice.
// ----------------------------------------------------------------------------
const LOCAL_CONTEXT_TIPS = [
  {
    // Cardiovascular disease is the leading cause of death in Kerala
    keywords: ['cardiovascular', 'heart disease', 'hypertension',
               'hypercholesterolemia', 'triglyceride', 'lipid',
               'atherosclerosis', 'coronary'],
    tip: {
      header: 'Kerala / India context — illustrative only',
      text:
        "Kerala has one of India's highest rates of heart disease. Free cardiovascular " +
        "risk screening (blood pressure, cholesterol, ECG) is available at government " +
        "Primary Health Centres (PHCs) across the state. Ayushman Bharat PM-JAY covers " +
        "a wide range of cardiac procedures for eligible families — check eligibility " +
        "at pmjay.gov.in.",
    },
  },
  {
    // Type 2 Diabetes — Kerala has very high prevalence
    keywords: ['diabetes', 'insulin resistance', 'type 2 diabetes', 'type 1 diabetes',
               'hyperglycaemia', 'glucose'],
    tip: {
      header: 'Kerala / India context — illustrative only',
      text:
        "Kerala has among the highest diabetes rates in India. Free blood glucose " +
        "testing is offered at government PHCs under the National Programme for " +
        "Prevention and Control of Cancer, Diabetes, CVD and Stroke. " +
        "Karunya Health Scheme and PM-JAY help cover specialist consultations " +
        "for eligible residents.",
    },
  },
  {
    // Alzheimer and dementia
    keywords: ['alzheimer', 'cognitive decline', 'dementia', 'neurodegeneration'],
    tip: {
      header: 'Kerala / India context — illustrative only',
      text:
        "Government Medical Colleges in Kerala (Thiruvananthapuram, Kozhikode, Thrissur) " +
        "have neurology departments with memory clinics. NIMHANS in Bengaluru is the " +
        "national referral centre for neurological care. The National Programme for " +
        "Health Care of the Elderly provides support for age-related cognitive " +
        "conditions at district hospitals.",
    },
  },
  {
    // Neural tube defects / MTHFR / folate
    keywords: ['neural tube', 'spina bifida', 'folate', 'homocysteine'],
    tip: {
      header: 'Kerala / India context — illustrative only',
      text:
        "Free folic acid supplementation during pregnancy is available at government " +
        "Anganwadi centres and PHCs under the Reproductive and Child Health programme. " +
        "Pre-conception genetic counselling for MTHFR variants is available at " +
        "genetic counselling clinics in Kerala government medical colleges.",
    },
  },
  {
    // Liver disease / Hereditary Hemochromatosis
    keywords: ['liver disease', 'hemochromatosis', 'hepatic', 'cirrhosis',
               'hepatitis', 'liver'],
    tip: {
      header: 'Kerala / India context — illustrative only',
      text:
        "Liver function tests and hepatitis B/C screening are available at government " +
        "hospitals across Kerala. PM-JAY covers liver disease management — including " +
        "transplantation — for eligible beneficiaries. Government Medical College " +
        "Ernakulam has a dedicated Hepatology unit.",
    },
  },
  {
    // Celiac / gluten sensitivity — traditional Kerala rice diet is a natural advantage
    keywords: ['celiac', 'coeliac', 'gluten', 'inflammatory bowel'],
    tip: {
      header: 'Kerala / India context — illustrative only',
      text:
        "The traditional Kerala diet is rice-based rather than wheat-heavy, which is " +
        "a natural advantage when managing gluten sensitivity. tTG-IgA antibody testing " +
        "for coeliac disease is available at government medical college labs. A hospital " +
        "dietitian can advise on adapting Kerala cuisine to your needs.",
    },
  },
  {
    // Cancer — Regional Cancer Centre Thiruvananthapuram
    keywords: ['cancer', 'melanoma', 'carcinoma', 'malignancy', 'colorectal',
               'breast cancer'],
    tip: {
      header: 'Kerala / India context — illustrative only',
      text:
        "The Regional Cancer Centre (RCC) in Thiruvananthapuram is one of India's leading " +
        "cancer care facilities and accepts referrals from across Kerala. PM-JAY covers " +
        "treatment for most cancers under its health benefit packages. Early detection " +
        "camps are run periodically by the Kerala Health Department — ask at your " +
        "local PHC about upcoming dates.",
    },
  },
  {
    // Statin-induced myopathy (SLCO1B1 variant)
    keywords: ['statin', 'myopathy', 'slco1b1'],
    tip: {
      header: 'Kerala / India context — illustrative only',
      text:
        "If a doctor recommends a statin for high cholesterol, share this genetic " +
        "finding with them first. Sree Chitra Tirunal Institute for Medical Sciences " +
        "(SCTIMST) in Thiruvananthapuram offers pharmacogenomics consultation. " +
        "Alternative lipid-lowering therapies exist that may be better suited to " +
        "your genetic profile.",
    },
  },
  {
    // Autoimmune / inflammatory conditions
    keywords: ['rheumatoid arthritis', 'crohn', 'ulcerative colitis',
               'autoimmune', 'lupus'],
    tip: {
      header: 'Kerala / India context — illustrative only',
      text:
        "Government Medical Colleges in Thiruvananthapuram, Kozhikode, and Kochi " +
        "have Rheumatology and Gastroenterology departments. Many autoimmune " +
        "therapies are covered under PM-JAY for eligible patients — ask your " +
        "treating physician about enrolment.",
    },
  },
  {
    // Obesity / metabolic syndrome
    keywords: ['obesity', 'metabolic syndrome', 'overweight'],
    tip: {
      header: 'Kerala / India context — illustrative only',
      text:
        "Urban Kerala has seen a sharp rise in obesity and metabolic syndrome. Free " +
        "dietary counselling is available at government PHCs. The traditional Kerala " +
        "diet — coconut, fish, and vegetables — can support a healthy metabolic profile " +
        "when refined carbohydrates are kept moderate.",
    },
  },
];

/**
 * getLocalContextTip(diseases)
 *
 * Returns the first matching local context tip for a variant's disease list,
 * or null if no match found.
 *
 * Intended for HIGH-risk variants only.
 *
 * @param {string[]} diseases
 * @returns {{ header: string, text: string } | null}
 */
export function getLocalContextTip(diseases) {
  if (!Array.isArray(diseases) || diseases.length === 0) return null;
  const haystack = diseases.join(' ').toLowerCase();
  for (const entry of LOCAL_CONTEXT_TIPS) {
    if (entry.keywords.some((kw) => haystack.includes(kw))) {
      return entry.tip;
    }
  }
  return null;
}
