export interface LegalDocumentSection {
  id: string;
  title: string;
  content: string;
  bulletPoints?: string[];
  calloutBox?: {
    type: "warning" | "info" | "success" | "notice";
    title: string;
    text: string;
  };
  tableData?: Array<{
    situation: string;
    eligible: boolean;
    refundDetails: string;
  }>;
}

export interface LegalDocument {
  id: "terms" | "privacy" | "refund" | "about";
  title: string;
  subtitle: string;
  lastUpdated: string;
  badge: string;
  governingLaw: string;
  jurisdiction: string;
  sections: LegalDocumentSection[];
}

export interface GrievanceOfficerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  operatingEntity: string;
  domain: string;
}

export const GRIEVANCE_OFFICER_DETAILS: GrievanceOfficerDetails = {
  name: "Vankayalapati Mallikharjuna Rao",
  email: "support.codexiaindia@gmail.com",
  phone: "7760593646",
  address: "",
  operatingEntity: "Vankayalapati Mallikharjuna Rao (trading as Codexia)",
  domain: "codexia.academy"
};

export const LEGAL_DOCUMENTS: Record<string, LegalDocument> = {
  about: {
    id: "about",
    title: "About Codexia",
    subtitle: "AI Training & Consulting Studio • Practice & Operating Principles",
    lastUpdated: "25 July 2026",
    badge: "Official Studio Overview",
    governingLaw: "Laws of Republic of India",
    jurisdiction: "Exclusive Jurisdiction of Courts in Bengaluru, Karnataka",
    sections: [
      {
        id: "about-intro",
        title: "1. About Codexia",
        content: `Codexia is an AI training and consulting studio operated by Vankayalapati Mallikharjuna Rao, based in Bengaluru, India. Codexia works with individuals and small teams, across any profession, to build and use practical, working AI tools in real day-to-day work - not just to learn AI in theory.`
      },
      {
        id: "about-programs",
        title: "2. Cohort Programs & Consulting",
        content: `Codexia runs two cohort-based programs - the Base Cohort, a 6-day sprint focused on building one working micro-bot, and Premium Alpha, a 13-day program focused on connecting multiple bots into a working system - alongside senior AI/engineering consulting services offered separately.`,
        calloutBox: {
          type: "info",
          title: "CORE COHORT TRACKS",
          text: "Base Cohort: 6-day sprint focused on building 1 working micro-bot • Premium Alpha: 13-day deep dive focused on connecting multiple bots into a working system."
        }
      },
      {
        id: "about-method",
        title: "3. The C.O.D.E. Method",
        content: `Codexia's teaching approach is built around its own C.O.D.E. Method (Context, Objective, Design, Evaluate), a structured way of working with AI models that is used throughout every program.`,
        calloutBox: {
          type: "notice",
          title: "PROPRIETARY METHODOLOGY",
          text: "The C.O.D.E. Method stands for Context, Objective, Design, Evaluate — our structured framework for robust AI application design."
        }
      },
      {
        id: "about-transparency",
        title: "4. Founder-Led Studio Commitment",
        content: `Codexia is an early-stage, founder-led studio. We are upfront that we are building our client and case-study history from the ground up, and we do not claim partnerships, endorsements, or a scale of operation we have not actually reached. What we do commit to is direct, senior-level attention in every cohort we run.`,
        calloutBox: {
          type: "success",
          title: "TRANSPARENCY GUARANTEE",
          text: "We do not claim unreached partnerships or endorsements. We guarantee direct, senior-level founder attention in every single cohort."
        }
      },
      {
        id: "about-contact",
        title: "5. Official Inquiries",
        content: `For questions about Codexia or its programs, write to support.codexiaindia@gmail.com.`
      }
    ]
  },

  terms: {
    id: "terms",
    title: "Terms and Conditions",
    subtitle: "Terms of Service, Licensing & Service Binding Parameters",
    lastUpdated: "25 July 2026",
    badge: "Official Terms of Service",
    governingLaw: "Laws of Republic of India",
    jurisdiction: "Courts of Bengaluru, Karnataka / Arbitration in Bengaluru",
    sections: [
      {
        id: "terms-intro",
        title: "1. Introduction and Acceptance",
        content: `This website ("Website") and the training and consulting services offered on it (together, the "Services") are operated by Vankayalapati Mallikharjuna Rao, trading as Codexia ("Codexia", "we", "us", or "our").

By accessing the Website, registering for a program, or otherwise using the Services, you agree to be bound by these Terms and Conditions and by our Privacy Policy and Refund and Cancellation Policy, each of which forms part of this agreement. If you do not agree, please do not use the Website or the Services.`
      },
      {
        id: "terms-eligibility",
        title: "2. Eligibility",
        content: `The Services are intended for use by individuals aged 18 years or older, or by an organization enrolling its employees or members, acting through an authorized adult representative. By enrolling, you confirm that you meet this requirement.`,
        calloutBox: {
          type: "warning",
          title: "AGE REQUIREMENT NOTICE",
          text: "Services are strictly intended for individuals aged 18 years or older, or authorized corporate representatives."
        }
      },
      {
        id: "terms-services",
        title: "3. Description of Services",
        content: `Codexia currently offers the Base Cohort (a 6-day live, cohort-based program) and Premium Alpha (a 13-day live, cohort-based program), along with separate consulting services such as fractional AI leadership and workflow/systems review. Program content, schedules, and included features may be refined over time as tools and methods evolve; the core learning objective of each program described at the time of your enrollment will be maintained.

Programs are delivered through live sessions and are not sold as fully self-paced, on-demand courses unless explicitly stated otherwise at the time of enrollment.`
      },
      {
        id: "terms-accounts",
        title: "4. Registration and Accounts",
        content: `You must register with accurate, complete, and current information, including your name and email address, to access the Services. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. Notify us promptly at support.codexiaindia@gmail.com if you suspect unauthorized use of your account.

Enrollment is personal and non-transferable. A seat, login, or program entitlement cannot be reassigned to another individual, whether for free or for consideration, except where Codexia expressly agrees to a transfer in writing.`,
        calloutBox: {
          type: "notice",
          title: "NON-TRANSFERABLE SEAT BINDING",
          text: "Program enrollments are strictly personal. Seats cannot be reassigned or transferred to another individual without prior written consent."
        }
      },
      {
        id: "terms-fees",
        title: "5. Fees and Payment",
        content: `Fees for each program are stated in Indian Rupees (INR) and/or US Dollars (USD) on the Website at the time of enrollment. Payments are processed through our third-party payment gateway partner, PayU, and are subject to PayU's own applicable terms. Codexia does not store your full card or payment credentials; these are handled directly by PayU.

Codexia is not currently registered for Goods and Services Tax (GST). Should this change, updated pricing and applicable tax information will be published on this Website in advance of being applied.

Prices shown at checkout, including any launch or promotional pricing, are the price locked in for that specific enrollment and are not retroactively increased.`,
        calloutBox: {
          type: "info",
          title: "TAX & PAYMENT GATEWAY DISCLOSURE",
          text: "All payments are processed securely through PayU. Codexia does not store full card credentials. Codexia is not currently registered for GST."
        }
      },
      {
        id: "terms-ip",
        title: "6. Intellectual Property",
        content: `All curriculum content, the C.O.D.E. Method, templates, prompts, and other materials made available as part of a Codexia program ("Program Material") are the intellectual property of Codexia or its licensors. You are granted a limited, non-exclusive, non-transferable, revocable license to access and use Program Material for your own personal or internal business use. You may not resell, publicly redistribute, or create competing commercial training material substantially derived from Program Material without Codexia's prior written consent.

Any specific bot, workflow, or system you personally build during a program using your own accounts and tools belongs to you.`,
        calloutBox: {
          type: "success",
          title: "YOUR BUILD OWNERSHIP",
          text: "While Codexia curriculum & templates remain Codexia IP, any custom bot or system you personally create during a program belongs 100% to you."
        }
      },
      {
        id: "terms-conduct",
        title: "7. Community Conduct",
        content: `Where a program includes access to a cohort community space, you agree not to post content that is unlawful, harassing, infringing of another's rights, or that discloses another participant's personal information without their consent. Codexia may remove content or restrict access for violations of this section.`
      },
      {
        id: "terms-refunds",
        title: "8. Refunds and Cancellations",
        content: `Refund and cancellation requests are handled in accordance with our separate Refund and Cancellation Policy, which forms part of these Terms and Conditions.`
      },
      {
        id: "terms-disclaimer",
        title: "9. Disclaimer and Limitation of Liability",
        content: `The Services are provided on an "as is" and "as available" basis. Codexia does not guarantee any specific career, income, or business outcome from participation in a program; results depend significantly on individual effort and circumstances. To the maximum extent permitted by law, Codexia's aggregate liability for any claim arising from the Services will not exceed the fees you actually paid for the specific program giving rise to the claim.`
      },
      {
        id: "terms-termination",
        title: "10. Termination",
        content: `Codexia may suspend or terminate your access to the Services if you breach these Terms, engage in conduct that is unlawful or harmful to other participants, or for non-payment of fees due. You may terminate your own account at any time by writing to support.codexiaindia@gmail.com.`
      },
      {
        id: "terms-governing",
        title: "11. Governing Law and Dispute Resolution",
        content: `These Terms are governed by the laws of India. Any dispute arising out of or in connection with these Terms shall first be attempted to be resolved amicably, failing which it shall be subject to arbitration by a sole arbitrator in Bengaluru, Karnataka, conducted in English under the Arbitration and Conciliation Act, 1996, or, where arbitration is not applicable, to the exclusive jurisdiction of the courts of Bengaluru, Karnataka.`
      },
      {
        id: "terms-changes",
        title: "12. Changes to These Terms",
        content: `Codexia may update these Terms from time to time. The "last updated" date at the top of this document will reflect the most recent revision. Continued use of the Services after an update constitutes acceptance of the revised Terms.`
      },
      {
        id: "terms-contact",
        title: "13. Grievance Officer and Contact",
        content: `For any questions, complaints, or grievances relating to these Terms, please contact:`,
        bulletPoints: [
          "Grievance Officer: Vankayalapati Mallikharjuna Rao",
          "Email: support.codexiaindia@gmail.com",
          "Phone: 7760593646"
        ]
      }
    ]
  },

  privacy: {
    id: "privacy",
    title: "Privacy Policy",
    subtitle: "Data Collection, IT Act 2000 & DPDP Act 2023 Compliance",
    lastUpdated: "25 July 2026",
    badge: "IT Act 2000 & DPDP Act 2023 Compliant",
    governingLaw: "Information Technology Act, 2000 & DPDP Act, 2023 (India)",
    jurisdiction: "Courts of Bengaluru, Karnataka",
    sections: [
      {
        id: "privacy-intro",
        title: "1. Introduction",
        content: `This Privacy Policy explains how Vankayalapati Mallikharjuna Rao, trading as Codexia, collects, uses, and protects information when you use this Website and its Services. It is published with reference to the Information Technology Act, 2000, the rules made thereunder, and the Digital Personal Data Protection Act, 2023. By using the Website, you consent to the practices described here.`
      },
      {
        id: "privacy-collection",
        title: "2. Information We Collect",
        content: `We may collect the following categories of information:`,
        bulletPoints: [
          "Identity and contact details you provide at registration - name, email address, phone number, and company name where applicable.",
          "Payment information processed through PayU at the time of enrollment - Codexia does not itself store your full card details.",
          "Cohort activity - your progress through curriculum days, community posts you make, and support requests you submit.",
          "Technical information automatically collected when you visit the Website, such as your IP address and browser/device information."
        ],
        calloutBox: {
          type: "info",
          title: "PAYU FINANCIAL DATA SECURITY",
          text: "Codexia never stores or sees your full payment credentials. Payment processing is completely handled by PayU under PCI-DSS standards."
        }
      },
      {
        id: "privacy-usage",
        title: "3. How We Use Your Information",
        content: `We use the information above to: provide and administer the Services you enroll in; process payments through PayU; communicate with you about your enrollment, cohort schedule, and support requests; maintain the security of our platform; and comply with applicable legal obligations. We do not use your information to make automated decisions that produce legal or similarly significant effects on you.`
      },
      {
        id: "privacy-cookies",
        title: "4. Cookies",
        content: `The Website may use cookies to keep you signed in and to understand basic usage of the Website. You can control cookies through your browser settings; disabling them may affect some features of the Website.`
      },
      {
        id: "privacy-sharing",
        title: "5. Sharing of Information",
        content: `We share your information only where necessary: with PayU, to process your payment; with communication tools we use to send you transactional emails; where required by law, regulation, or a valid legal process; or where necessary to protect the rights, property, or safety of Codexia or other users. We do not sell your personal information to third parties.`
      },
      {
        id: "privacy-security",
        title: "6. Data Security",
        content: `We take reasonable technical and organizational measures to protect your information from unauthorized access, loss, or misuse. No method of transmission over the internet is completely secure, and while we work to protect your information, we cannot guarantee absolute security.`
      },
      {
        id: "privacy-retention",
        title: "7. Data Retention",
        content: `We retain your personal information for as long as necessary to provide the Services, to comply with our legal and tax obligations, and to resolve disputes. If you request account closure, we will delete or anonymize your information except where retention is required by law.`
      },
      {
        id: "privacy-rights",
        title: "8. Your Rights",
        content: `You may request access to, correction of, or deletion of your personal information, and you may withdraw consent for its processing, by writing to support.codexiaindia@gmail.com. We will respond within a reasonable timeframe.`
      },
      {
        id: "privacy-children",
        title: "9. Children's Information",
        content: `The Services are intended for individuals aged 18 years or older. We do not knowingly collect personal information from children.`
      },
      {
        id: "privacy-changes",
        title: "10. Changes to This Policy",
        content: `We may update this Privacy Policy from time to time; the "last updated" date above will reflect the most recent revision. Material changes will be notified via email or a notice on the Website.`
      },
      {
        id: "privacy-contact",
        title: "11. Grievance Officer and Contact",
        content: `For privacy-related questions or requests, contact:`,
        bulletPoints: [
          "Grievance Officer: Vankayalapati Mallikharjuna Rao",
          "Email: support.codexiaindia@gmail.com",
          "Phone: 7760593646"
        ]
      }
    ]
  },

  refund: {
    id: "refund",
    title: "Refund and Cancellation Policy",
    subtitle: "Cancellation Window, PayU Fee Deductions & Eligibility Matrix",
    lastUpdated: "25 July 2026",
    badge: "PayU Aligned Refund Policy",
    governingLaw: "Laws of Republic of India",
    jurisdiction: "Courts of Bengaluru, Karnataka",
    sections: [
      {
        id: "refund-overview",
        title: "1. Overview",
        content: `This policy explains when you are eligible for a refund or cancellation of your Codexia program enrollment (Base Cohort or Premium Alpha). It applies to all payments made through our payment gateway partner, PayU.`
      },
      {
        id: "refund-window",
        title: "2. Cancellation Window",
        content: `You may cancel your enrollment and receive a full refund, less the payment gateway processing fee described in Section 5, if your cancellation request is received in writing at support.codexiaindia@gmail.com within 3 (three) calendar days of your payment date, and before the first live session (Day 1) of your enrolled cohort has begun. This is the standard cancellation duration applicable to all Codexia program enrollments.`,
        calloutBox: {
          type: "warning",
          title: "MANDATORY 3-DAY CANCELLATION RULE",
          text: "Cancellation requests must be received within 3 calendar days of payment AND before Day 1 live session starts. A pass-through PayU processing fee applies."
        },
        tableData: [
          {
            situation: "Cancel within 3 days of payment, before Day 1 begins",
            eligible: true,
            refundDetails: "Full refund, less processing fee"
          },
          {
            situation: "Cancel after Day 1 has begun",
            eligible: false,
            refundDetails: "Program has commenced; not eligible"
          },
          {
            situation: "Codexia cancels the entire cohort",
            eligible: true,
            refundDetails: "100% refund, no deductions"
          },
          {
            situation: "Duplicate payment for the same enrollment",
            eligible: true,
            refundDetails: "Full refund of the duplicate charge"
          },
          {
            situation: "Payment deducted but enrollment not confirmed",
            eligible: true,
            refundDetails: "Write in within 48 hours with transaction ID"
          },
          {
            situation: "Personal reasons after the 3-day window",
            eligible: false,
            refundDetails: "Not eligible"
          },
          {
            situation: "Non-attendance of live sessions",
            eligible: false,
            refundDetails: "Not eligible"
          },
          {
            situation: "Cohort completed",
            eligible: false,
            refundDetails: "Not eligible"
          }
        ]
      },
      {
        id: "refund-codexia-cancel",
        title: "3. Codexia-Initiated Cancellation",
        content: `If Codexia cancels an entire cohort without offering a rescheduled alternative, all enrolled participants will receive a 100% refund of fees paid, with no deductions, processed within 10 business days of the cancellation notice.`,
        calloutBox: {
          type: "success",
          title: "100% REFUND GUARANTEE ON STUDIO CANCELLATION",
          text: "If Codexia cancels a cohort, participants receive 100% refund with ZERO deductions within 10 business days."
        }
      },
      {
        id: "refund-rescheduling",
        title: "4. Rescheduling",
        content: `If a cohort's start date is postponed, your enrollment carries over to the rescheduled date at no additional cost. If the new date is more than 21 days after the original date and does not work for you, you may write to support.codexiaindia@gmail.com to request a refund, which will be considered on a case-by-case basis.`
      },
      {
        id: "refund-deductions",
        title: "5. Deductions",
        content: `Where a refund is approved, the payment gateway processing fee charged by PayU on the original transaction (currently up to 3%) will be deducted from the refunded amount. This is a pass-through cost charged by PayU and is not retained by Codexia. No deduction applies where Codexia itself cancels the cohort (Section 3).`,
        calloutBox: {
          type: "notice",
          title: "PAYU PASS-THROUGH FEE (UP TO 3%)",
          text: "PayU payment gateway processing fee (up to 3%) is non-refundable by PayU and is deducted from approved user-initiated refunds."
        }
      },
      {
        id: "refund-duplicate",
        title: "6. Duplicate Payments and Payment Errors",
        content: `If you are charged more than once for the same enrollment due to a technical error, or if your payment was deducted but your enrollment was not confirmed, write to support.codexiaindia@gmail.com with your transaction ID within 48 hours. We will verify the transaction with PayU and either confirm your enrollment or process a full refund within 7 business days.`
      },
      {
        id: "refund-request",
        title: "7. How to Request a Refund or Cancellation",
        content: `Email support.codexiaindia@gmail.com with the subject line "Refund Request - [Your Full Name] - [Program Name]", including your registered email address, payment/transaction reference, date of payment, and reason for the request. We will respond within 3 business days.`
      },
      {
        id: "refund-processing",
        title: "8. Refund Processing",
        content: `Approved refunds are credited to your original payment method via PayU within 7 to 10 business days of approval.`
      },
      {
        id: "refund-contact",
        title: "9. Contact",
        content: `Vankayalapati Mallikharjuna Rao
Email: support.codexiaindia@gmail.com
Phone: 7760593646`
      }
    ]
  }
};
