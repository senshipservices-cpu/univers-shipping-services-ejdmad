
export type Language = 'fr' | 'en' | 'es' | 'ar';

export interface Translations {
  languageSelection: {
    title: string;
    subtitle: string;
    selectLanguage: string;
    continue: string;
    french: string;
    english: string;
    spanish: string;
    arabic: string;
  };
  home: {
    title: string;
    subtitle: string;
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    discoverServices: string;
    requestQuote: string;
    requestGlobalQuote: string;
    talkToExpert: string;
    servicesTitle: string;
    servicesSubtitle: string;
    maritimeShipping: string;
    maritimeShippingDesc: string;
    logisticsPortHandling: string;
    logisticsPortHandlingDesc: string;
    tradeConsulting: string;
    tradeConsultingDesc: string;
    digitalSolutions: string;
    digitalSolutionsDesc: string;
    viewServices: string;
    coverageTitle: string;
    coverageText: string;
    viewAllPorts: string;
    whyUsTitle: string;
    whyUs1: string;
    whyUs2: string;
    whyUs3: string;
    whyUs4: string;
    ctaText: string;
    ctaButton: string;
    globalServices: string;
    globalServicesDesc: string;
    portCoverage: string;
    portCoverageDesc: string;
    becomeAgent: string;
    becomeAgentDesc: string;
    clientSpace: string;
    clientSpaceDesc: string;
    pricing: string;
    pricingDesc: string;
    featuredServicesTitle: string;
    featuredServicesSubtitle: string;
    requestQuoteBtn: string;
    viewPricingBtn: string;
    consultExpertBtn: string;
    accessPortalBtn: string;
    profileSolutionsTitle: string;
    profileSolutionsSubtitle: string;
    profileImportersExporters: string;
    profileImportersPoint1: string;
    profileImportersPoint2: string;
    profileImportersPoint3: string;
    profileImportersButton: string;
    profileShipowners: string;
    profileShipownersPoint1: string;
    profileShipownersPoint2: string;
    profileShipownersPoint3: string;
    profileShipownersButton: string;
    profileBusinessB2B: string;
    profileBusinessPoint1: string;
    profileBusinessPoint2: string;
    profileBusinessPoint3: string;
    profileBusinessButton: string;
    whyChooseUsTitle: string;
    whyChooseUsAdvantage1Title: string;
    whyChooseUsAdvantage1Desc: string;
    whyChooseUsAdvantage2Title: string;
    whyChooseUsAdvantage2Desc: string;
    whyChooseUsAdvantage3Title: string;
    whyChooseUsAdvantage3Desc: string;
    whyChooseUsAdvantage4Title: string;
    whyChooseUsAdvantage4Desc: string;
    finalCtaTitle: string;
    finalCtaSubtitle: string;
    finalCtaContactExpert: string;
    finalCtaViewPricing: string;
    mainCta: string;
    mainCtaMicrocopy: string;
  };
  regions: {
    africa: string;
    europe: string;
    asia: string;
    americas: string;
    middleEast: string;
    oceania: string;
  };
  globalServices: {
    title: string;
    subtitle: string;
    heroTitle: string;
    maritime: string;
    logistics: string;
    customs: string;
    warehousing: string;
    allCategories: string;
    maritimeShipping: string;
    logisticsPortHandling: string;
    tradeConsulting: string;
    digitalServices: string;
    premium: string;
    details: string;
    requestOffer: string;
    category: string;
    noServices: string;
    loading: string;
    requestQuote: string;
    viewPricing: string;
    consultExpert: string;
    accessPortal: string;
    ctaQuote: string;
    ctaPricing: string;
    ctaExpert: string;
    ctaPortal: string;
  };
  portCoverage: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allRegions: string;
    hub: string;
    viewDetails: string;
    services: string;
    agents: string;
    agentsInPort: string;
    noAgents: string;
    premium: string;
    activities: string;
    experience: string;
    years: string;
    contact: string;
    ctaText: string;
    ctaButton: string;
    noPorts: string;
    loading: string;
  };
  becomeAgent: {
    title: string;
    subtitle: string;
    introduction: string;
    conditionsTitle: string;
    condition1: string;
    condition2: string;
    condition3: string;
    advantagesTitle: string;
    advantage1: string;
    advantage2: string;
    advantage3: string;
    apply: string;
    applicationForm: string;
    companyInfo: string;
    companyName: string;
    companyNamePlaceholder: string;
    contactName: string;
    contactNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    whatsapp: string;
    whatsappPlaceholder: string;
    website: string;
    websitePlaceholder: string;
    portSelection: string;
    selectPort: string;
    searchPort: string;
    activities: string;
    selectActivities: string;
    yearsExperience: string;
    certifications: string;
    certificationsPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    submitApplication: string;
    submitting: string;
    successTitle: string;
    successMessage: string;
    backToHome: string;
    errorTitle: string;
    errorMessage: string;
    requiredField: string;
    invalidEmail: string;
    selectAtLeastOne: string;
    ctaButton: string;
    ctaMicrocopy: string;
  };
  clientSpace: {
    title: string;
    login: string;
    register: string;
    tracking: string;
    documents: string;
    dashboard: string;
    myProfile: string;
    shipments: string;
    subscription: string;
  };
  pricing: {
    title: string;
    subtitle: string;
    getQuote: string;
    basicTitle: string;
    basicPrice: string;
    basicDesc: string;
    basicFeature1: string;
    basicFeature2: string;
    basicFeature3: string;
    basicButton: string;
    premiumTitle: string;
    premiumPrice: string;
    premiumDesc: string;
    premiumFeature1: string;
    premiumFeature2: string;
    premiumFeature3: string;
    premiumButton: string;
    premiumButtonMicrocopy: string;
    enterpriseTitle: string;
    enterprisePrice: string;
    enterpriseDesc: string;
    enterpriseFeature1: string;
    enterpriseFeature2: string;
    enterpriseFeature3: string;
    enterpriseButton: string;
    agentTitle: string;
    agentPrice: string;
    agentDesc: string;
    agentFeature1: string;
    agentFeature2: string;
    agentFeature3: string;
    agentButton: string;
    faqTitle: string;
    faqQuestion1: string;
    faqAnswer1: string;
    faqQuestion2: string;
    faqAnswer2: string;
    faqQuestion3: string;
    faqAnswer3: string;
    faqQuestion4: string;
    faqAnswer4: string;
    howItWorksTitle: string;
  };
  freightQuote: {
    faqTitle: string;
    faqQuestion1: string;
    faqAnswer1: string;
    faqQuestion2: string;
    faqAnswer2: string;
    faqQuestion3: string;
    faqAnswer3: string;
    faqQuestion4: string;
    faqAnswer4: string;
    faqQuestion5: string;
    faqAnswer5: string;
    howItWorksTitle: string;
  };
  becomeAgentFaq: {
    faqTitle: string;
    faqQuestion1: string;
    faqAnswer1: string;
    faqQuestion2: string;
    faqAnswer2: string;
    faqQuestion3: string;
    faqAnswer3: string;
    faqQuestion4: string;
    faqAnswer4: string;
  };
  howItWorks: {
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
  };
  confidenceBanner: {
    block1Title: string;
    block1Desc: string;
    block2Title: string;
    block2Desc: string;
    block3Title: string;
    block3Desc: string;
    block4Title: string;
    block4Desc: string;
  };
  trustBar: {
    item1: string;
    item2: string;
    item3: string;
    item4: string;
  };
  microCopies: {
    fastResponse: string;
    noCommitment: string;
    secureOperations: string;
    dataProtected: string;
  };
  feedbackMessages: {
    quoteSubmitted: string;
    agentApplicationSubmitted: string;
    subscriptionActivated: string;
    documentAdded: string;
  };
  digitalPortal: {
    title: string;
    welcomeTitle: string;
    welcomeSubtitle: string;
    redirecting: string;
    featuresTitle: string;
    advancedTracking: string;
    advancedTrackingDesc: string;
    documents: string;
    documentsDesc: string;
    analytics: string;
    analyticsDesc: string;
    apiAccess: string;
    apiAccessDesc: string;
    quickActions: string;
    newQuote: string;
    contactSupport: string;
    resources: string;
    userGuide: string;
    userGuideDesc: string;
    apiDocs: string;
    apiDocsDesc: string;
    support: string;
    supportDesc: string;
    infoBanner: string;
  };
  common: {
    back: string;
    next: string;
    submit: string;
    cancel: string;
    save: string;
    loading: string;
    close: string;
    error: string;
  };
}

export const translations: Record<Language, Translations> = {
  fr: {
    languageSelection: {
      title: 'Bienvenue sur UNIVERSAL SHIPPING SERVICES',
      subtitle: 'Choisissez votre langue préférée pour commencer',
      selectLanguage: 'Sélectionnez votre langue',
      continue: 'Continuer',
      french: 'Français',
      english: 'English',
      spanish: 'Español',
      arabic: 'العربية',
    },
    home: {
      title: 'UNIVERSAL SHIPPING SERVICES',
      subtitle: 'UNIVERSAL SHIPPING SERVICES',
      heroTitle: 'Global Maritime & Logistics Solutions',
      heroSubtitle: 'Connecting Ships, Ports & Businesses Worldwide',
      heroDescription: 'Des solutions maritimes et logistiques complètes pour connecter vos opérations à travers le monde.',
      discoverServices: 'Découvrir nos services',
      requestQuote: 'Demander un devis',
      requestGlobalQuote: 'Demander un devis global',
      talkToExpert: 'Parler à un expert',
      servicesTitle: 'Nos principaux domaines de services',
      servicesSubtitle: 'Des solutions intégrées pour le shipping, la logistique et le consulting.',
      maritimeShipping: 'Maritime & Shipping',
      maritimeShippingDesc: 'Affrètement, consignation, opérations maritimes et gestion de flotte pour tous types de navires.',
      logisticsPortHandling: 'Logistics & Port Handling',
      logisticsPortHandlingDesc: 'Manutention portuaire, entreposage, transport multimodal et gestion de la chaîne logistique.',
      tradeConsulting: 'Trade & Consulting',
      tradeConsultingDesc: 'Conseil en commerce international, optimisation des flux et accompagnement réglementaire.',
      digitalSolutions: 'Digital Maritime Solutions',
      digitalSolutionsDesc: 'Plateformes digitales, tracking en temps réel et solutions technologiques pour le maritime.',
      viewServices: 'Voir les services',
      coverageTitle: 'Une couverture mondiale, de Dakar à Singapour',
      coverageText: 'Nous opérons via un réseau d\'agents et de ports partenaires en Afrique, Europe, Asie, Amériques et Océanie.',
      viewAllPorts: 'Voir tous nos ports',
      whyUsTitle: 'Pourquoi travailler avec nous ?',
      whyUs1: '+15 ans d\'expérience maritime & logistique',
      whyUs2: 'Réseau global d\'agents et de ports partenaires',
      whyUs3: 'Solutions sur mesure pour chaque chaîne logistique',
      whyUs4: 'Support client réactif et suivi en temps réel',
      ctaText: 'Prêt à optimiser vos opérations maritimes et logistiques ?',
      ctaButton: 'Parler à un expert',
      globalServices: 'Services Globaux',
      globalServicesDesc: 'Services maritimes et logistiques complets',
      portCoverage: 'Couverture Portuaire',
      portCoverageDesc: 'Réseau mondial de ports et terminaux',
      becomeAgent: 'Devenir Agent Global',
      becomeAgentDesc: 'Rejoignez notre réseau de partenaires',
      clientSpace: 'Espace Client',
      clientSpaceDesc: 'Accédez à votre compte et suivez vos envois',
      pricing: 'Tarification',
      pricingDesc: 'Obtenez un devis personnalisé',
      featuredServicesTitle: 'Nos Services Phares',
      featuredServicesSubtitle: 'Les solutions les plus demandées par nos clients internationaux.',
      requestQuoteBtn: 'Demander un devis',
      viewPricingBtn: 'Voir tarifs',
      consultExpertBtn: 'Consulter un expert',
      accessPortalBtn: 'Accéder au portail',
      profileSolutionsTitle: 'Solutions adaptées à votre activité',
      profileSolutionsSubtitle: 'Découvrez nos services selon votre profil',
      profileImportersExporters: 'Importateurs / Exportateurs',
      profileImportersPoint1: 'Fret maritime & aérien',
      profileImportersPoint2: 'Solutions Door-to-Door',
      profileImportersPoint3: 'Douane & conformité',
      profileImportersButton: 'Trouver un service',
      profileShipowners: 'Armateurs / Navires',
      profileShipownersPoint1: 'Ship Agency',
      profileShipownersPoint2: 'Crew Change',
      profileShipownersPoint3: 'Bunker Supply',
      profileShipownersButton: 'Services navires',
      profileBusinessB2B: 'Entreprises & B2B',
      profileBusinessPoint1: 'Consulting & audits',
      profileBusinessPoint2: 'Sourcing international',
      profileBusinessPoint3: 'Solutions digitales',
      profileBusinessButton: 'Voir solutions B2B',
      whyChooseUsTitle: 'Pourquoi choisir Univers Shipping Services ?',
      whyChooseUsAdvantage1Title: 'Couverture internationale',
      whyChooseUsAdvantage1Desc: 'Ports en Afrique, Europe, Asie, Amériques.',
      whyChooseUsAdvantage2Title: 'Support 24/7',
      whyChooseUsAdvantage2Desc: 'Assistance opérationnelle continue.',
      whyChooseUsAdvantage3Title: 'Solutions intégrées',
      whyChooseUsAdvantage3Desc: 'Maritime • Logistique • Douane • Digital.',
      whyChooseUsAdvantage4Title: 'Experts certifiés',
      whyChooseUsAdvantage4Desc: '25+ ans d\'expérience.',
      finalCtaTitle: 'Besoin d\'une solution personnalisée ?',
      finalCtaSubtitle: 'Nos experts sont à votre disposition pour analyser vos besoins et vous proposer une solution sur mesure.',
      finalCtaContactExpert: 'Contacter un expert',
      finalCtaViewPricing: 'Voir nos tarifs',
      mainCta: 'Obtenir un devis en moins de 3 minutes',
      mainCtaMicrocopy: 'Réponse rapide garantie',
    },
    regions: {
      africa: 'Afrique',
      europe: 'Europe',
      asia: 'Asie',
      americas: 'Amériques',
      middleEast: 'Moyen-Orient',
      oceania: 'Océanie',
    },
    globalServices: {
      title: 'Nos services globaux',
      subtitle: 'Des solutions maritimes, portuaires, logistiques et de consulting adaptées à vos flux internationaux.',
      heroTitle: 'Services Maritimes & Logistiques Mondiaux',
      maritime: 'Services Maritimes',
      logistics: 'Logistique',
      customs: 'Douanes',
      warehousing: 'Entreposage',
      allCategories: 'Tous',
      maritimeShipping: 'Maritime & Shipping Services',
      logisticsPortHandling: 'Logistics & Port Handling',
      tradeConsulting: 'Trade & Consulting',
      digitalServices: 'Digital Services',
      premium: 'Premium',
      details: 'Détails',
      requestOffer: 'Demander une offre pour ce service',
      category: 'Catégorie',
      noServices: 'Aucun service disponible pour cette catégorie.',
      loading: 'Chargement des services...',
      requestQuote: 'Demander un devis',
      viewPricing: 'Voir tarifs',
      consultExpert: 'Consulter un expert',
      accessPortal: 'Accéder au portail',
      ctaQuote: 'Demander un devis immédiat',
      ctaPricing: 'Voir nos tarifs',
      ctaExpert: 'Parler à un expert',
      ctaPortal: 'Accéder au portail digital',
    },
    portCoverage: {
      title: 'Nos ports partenaires',
      subtitle: 'Une couverture portuaire mondiale grâce à notre réseau d\'agents locaux.',
      searchPlaceholder: 'Rechercher un port...',
      allRegions: 'Tous',
      hub: 'Hub',
      viewDetails: 'Voir les détails',
      services: 'Services disponibles',
      agents: 'Agents',
      agentsInPort: 'Agents UNIVERSAL SHIPPING SERVICES dans ce port',
      noAgents: 'Aucun agent disponible pour ce port.',
      premium: 'Premium',
      activities: 'Activités',
      experience: 'Expérience',
      years: 'ans',
      contact: 'Contact',
      ctaText: 'Vous représentez un port ou une agence maritime ?',
      ctaButton: 'Devenir agent partenaire',
      noPorts: 'Aucun port trouvé pour cette région.',
      loading: 'Chargement des ports...',
    },
    becomeAgent: {
      title: 'Devenir agent partenaire UNIVERSAL SHIPPING SERVICES',
      subtitle: 'Rejoignez le réseau international de UNIVERSAL SHIPPING SERVICES et représentez nos services dans votre port.',
      introduction: 'Nous construisons un réseau global d\'agents maritimes, logisticiens, consignataires et transitaires dans les principaux ports du monde. En devenant agent UNIVERSAL SHIPPING SERVICES, vous bénéficiez d\'une visibilité internationale, de flux de clients B2B et d\'un support opérationnel depuis notre siège.',
      conditionsTitle: 'Conditions minimales recommandées',
      condition1: 'Être établi dans un port commercial ou industriel',
      condition2: 'Avoir au moins 2 ans d\'expérience dans les services maritimes, douaniers ou logistiques',
      condition3: 'Disposer d\'une équipe opérationnelle dédiée',
      advantagesTitle: 'Avantages pour l\'agent',
      advantage1: 'Visibilité sur notre plateforme globale',
      advantage2: 'Recommandations de clients B2B qualifiés',
      advantage3: 'Collaboration sur des dossiers d\'affrètement, consignation et logistique',
      apply: 'Postuler maintenant',
      applicationForm: 'Formulaire de candidature',
      companyInfo: 'Informations sur l\'entreprise',
      companyName: 'Nom de la société',
      companyNamePlaceholder: 'Entrez le nom de votre société',
      contactName: 'Nom du contact',
      contactNamePlaceholder: 'Votre nom complet',
      email: 'Adresse email de contact',
      emailPlaceholder: 'votre@email.com',
      phone: 'Téléphone',
      phonePlaceholder: '+33 6 12 34 56 78',
      whatsapp: 'Numéro WhatsApp',
      whatsappPlaceholder: '+33 6 12 34 56 78',
      website: 'Site web (optionnel)',
      websitePlaceholder: 'https://www.votresite.com',
      portSelection: 'Port principal d\'opération',
      selectPort: 'Port principal d\'opération',
      searchPort: 'Rechercher un port...',
      activities: 'Type d\'activités',
      selectActivities: 'Sélectionnez vos activités',
      yearsExperience: 'Années d\'expérience',
      certifications: 'Certificats et agréments (ISO, BSC, etc.)',
      certificationsPlaceholder: 'ISO 9001, IATA, BSC, etc.',
      message: 'Message (optionnel)',
      messagePlaceholder: 'Parlez-nous de votre entreprise et de votre expérience...',
      submitApplication: 'Envoyer ma candidature',
      submitting: 'Envoi en cours...',
      successTitle: 'Merci !',
      successMessage: 'Votre candidature a bien été reçue.\n\nNos équipes vont analyser votre profil et reviendront vers vous rapidement.',
      backToHome: 'Retour à l\'accueil',
      errorTitle: 'Erreur',
      errorMessage: 'Une erreur s\'est produite lors de l\'envoi de votre candidature. Veuillez réessayer.',
      requiredField: 'Ce champ est requis',
      invalidEmail: 'Email invalide',
      selectAtLeastOne: 'Sélectionnez au moins une activité',
      ctaButton: 'Soumettre ma candidature d\'agent',
      ctaMicrocopy: 'Réponse sous 24–48h',
    },
    clientSpace: {
      title: 'Espace Client',
      login: 'Connexion',
      register: 'Inscription',
      tracking: 'Suivi',
      documents: 'Documents',
      dashboard: 'Tableau de bord',
      myProfile: 'Mon profil',
      shipments: 'Expéditions',
      subscription: 'Abonnement',
    },
    pricing: {
      title: 'Plans & Abonnements',
      subtitle: 'Choisissez le niveau de service adapté à votre activité.',
      getQuote: 'Demander un devis',
      basicTitle: 'Basic Global Access',
      basicPrice: 'Gratuit',
      basicDesc: 'Accès aux informations de base, demande de devis et contact avec nos équipes.',
      basicFeature1: 'Accès au catalogue de services',
      basicFeature2: 'Demande de devis en ligne',
      basicFeature3: 'Contact email standard',
      basicButton: 'Commencer',
      premiumTitle: 'Premium Tracking',
      premiumPrice: '49 € / mois',
      premiumDesc: 'Suivi avancé de vos expéditions et support prioritaire.',
      premiumFeature1: 'Accès complet au tracking des shipments',
      premiumFeature2: 'Notifications email sur les changements de statut',
      premiumFeature3: 'Support prioritaire',
      premiumButton: 'Activer ce plan maintenant',
      premiumButtonMicrocopy: 'Sans engagement',
      enterpriseTitle: 'Enterprise Logistics',
      enterprisePrice: '99 € / mois',
      enterpriseDesc: 'Solution logistique globale pour les entreprises avec volumes récurrents.',
      enterpriseFeature1: 'Tout Premium Tracking',
      enterpriseFeature2: 'Reporting avancé',
      enterpriseFeature3: 'Gestion multi-sites (future option)',
      enterpriseButton: 'Parler à un expert',
      agentTitle: 'Agent Global Listing',
      agentPrice: '99 € / an',
      agentDesc: 'Soyez visible comme agent officiel UNIVERSAL SHIPPING SERVICES dans votre port.',
      agentFeature1: 'Profil agent validé et public',
      agentFeature2: 'Mise en avant sur la page Port Coverage',
      agentFeature3: 'Badge "Premium Agent"',
      agentButton: 'Devenir agent',
      faqTitle: 'Questions Fréquentes',
      faqQuestion1: 'Puis-je changer de plan à tout moment ?',
      faqAnswer1: 'Oui, vous pouvez changer de plan à tout moment. Le changement prendra effet immédiatement et sera proratisé selon votre période de facturation.',
      faqQuestion2: 'Les paiements sont-ils sécurisés ?',
      faqAnswer2: 'Absolument. Nous utilisons des systèmes de paiement sécurisés conformes aux normes PCI-DSS. Toutes les transactions sont cryptées et vos données bancaires ne sont jamais stockées sur nos serveurs.',
      faqQuestion3: 'Qu\'est-ce que le Digital Maritime Portal ?',
      faqAnswer3: 'Le Digital Maritime Portal est une plateforme complète qui vous donne accès au tracking avancé, à la gestion documentaire, aux rapports personnalisés et à l\'intégration API pour automatiser vos opérations.',
      faqQuestion4: 'Les plans incluent-ils l\'assistance 24/7 ?',
      faqAnswer4: 'Le support 24/7 est inclus dans les plans Premium Tracking et Enterprise Logistics. Le plan Basic bénéficie d\'un support par email en heures ouvrables.',
      howItWorksTitle: 'Comment ça marche ?',
    },
    freightQuote: {
      faqTitle: 'Questions Fréquentes — Devis & Commandes',
      faqQuestion1: 'Comment fonctionne la demande de devis ?',
      faqAnswer1: 'Remplissez simplement le formulaire avec les détails de votre cargaison et vos ports d\'origine/destination. Notre équipe analyse votre demande et vous envoie un devis détaillé sous 24-48h.',
      faqQuestion2: 'Combien de temps pour recevoir un devis ?',
      faqAnswer2: 'Vous recevrez votre devis personnalisé sous 24 à 48 heures ouvrables. Pour les demandes urgentes, contactez-nous directement par téléphone ou WhatsApp.',
      faqQuestion3: 'Puis-je accepter un devis directement en ligne ?',
      faqAnswer3: 'Oui ! Une fois votre devis reçu, vous pouvez l\'accepter directement depuis votre espace client. Le processus de confirmation est simple et sécurisé.',
      faqQuestion4: 'Quels ports sont supportés ?',
      faqAnswer4: 'Nous couvrons plus de 150 ports dans le monde entier en Afrique, Europe, Asie, Amériques et Océanie. Consultez notre page "Couverture Portuaire" pour voir la liste complète.',
      faqQuestion5: 'La demande est-elle gratuite ?',
      faqAnswer5: 'Oui, la demande de devis est entièrement gratuite et sans engagement. Vous ne payez que si vous acceptez le devis proposé.',
      howItWorksTitle: 'Comment ça marche ?',
    },
    becomeAgentFaq: {
      faqTitle: 'Questions Fréquentes — Agents Internationaux',
      faqQuestion1: 'Quels sont les critères pour devenir agent ?',
      faqAnswer1: 'Vous devez être établi dans un port commercial, avoir au moins 2 ans d\'expérience dans les services maritimes ou logistiques, et disposer d\'une équipe opérationnelle dédiée.',
      faqQuestion2: 'Quels avantages pour un agent 3S ?',
      faqAnswer2: 'Visibilité internationale sur notre plateforme, recommandations de clients B2B qualifiés, collaboration sur des projets d\'affrètement et de logistique, et support opérationnel depuis notre siège.',
      faqQuestion3: 'Combien de temps pour la validation ?',
      faqAnswer3: 'Le processus de validation prend généralement 5 à 10 jours ouvrables. Notre équipe analyse votre profil, vérifie vos références et vous contacte pour finaliser votre inscription.',
      faqQuestion4: 'Qu\'est-ce qu\'un Premium Agent Listing ?',
      faqAnswer4: 'Le Premium Agent Listing vous donne une visibilité maximale sur notre plateforme avec un badge "Premium", une mise en avant sur la page Port Coverage, et un profil détaillé avec vos certifications et services.',
    },
    howItWorks: {
      step1Title: 'Étape 1 — Soumettre la demande',
      step1Desc: 'Sélection des ports, service et cargaison.',
      step2Title: 'Étape 2 — Analyse expert',
      step2Desc: 'Notre équipe étudie la demande et calcule un tarif.',
      step3Title: 'Étape 3 — Validation & Paiement',
      step3Desc: 'Le devis peut être accepté directement dans l\'app.',
      step4Title: 'Étape 4 — Suivi en temps réel',
      step4Desc: 'Accès au portail digital pour suivre chaque étape.',
    },
    confidenceBanner: {
      block1Title: 'Support 24/7',
      block1Desc: 'Assistance opérationnelle maritime & logistique.',
      block2Title: 'Experts certifiés',
      block2Desc: '15 ans d\'expérience internationale.',
      block3Title: 'Sécurité & conformité',
      block3Desc: 'Standards ISPS – Douanes – IMO.',
      block4Title: 'Traitement prioritaire',
      block4Desc: 'Pour les clients Premium et Enterprise.',
    },
    trustBar: {
      item1: 'Paiement 100% sécurisé',
      item2: 'Validation sous 24–48h',
      item3: 'Accès immédiat après activation',
      item4: 'Données chiffrées et protégées',
    },
    microCopies: {
      fastResponse: 'Réponse rapide garantie',
      noCommitment: 'Sans engagement',
      secureOperations: 'Opérations sécurisées',
      dataProtected: 'Données protégées',
    },
    feedbackMessages: {
      quoteSubmitted: 'Votre demande a été envoyée. Un expert va vous répondre rapidement.',
      agentApplicationSubmitted: 'Votre candidature a été transmise. Réponse sous 24–48h.',
      subscriptionActivated: 'Merci ! Votre abonnement est en cours d\'activation.',
      documentAdded: 'Document ajouté avec succès.',
    },
    digitalPortal: {
      title: 'Portail Digital Maritime',
      welcomeTitle: 'Bienvenue sur votre Portail Digital',
      welcomeSubtitle: 'Accédez à tous vos outils de gestion maritime et logistique en un seul endroit.',
      redirecting: 'Redirection vers la page de tarification...',
      featuresTitle: 'Fonctionnalités du portail',
      advancedTracking: 'Suivi Avancé',
      advancedTrackingDesc: 'Suivez vos expéditions en temps réel avec des mises à jour détaillées et des notifications automatiques.',
      documents: 'Documents & Rapports',
      documentsDesc: 'Accédez à tous vos documents d\'expédition, factures et rapports personnalisés.',
      analytics: 'Analytiques & Reporting',
      analyticsDesc: 'Visualisez vos statistiques d\'expédition et générez des rapports détaillés pour optimiser vos opérations.',
      apiAccess: 'Accès API',
      apiAccessDesc: 'Intégrez nos services dans vos systèmes avec notre API REST complète et documentée.',
      quickActions: 'Actions rapides',
      newQuote: 'Nouveau devis',
      contactSupport: 'Contacter le support',
      resources: 'Ressources',
      userGuide: 'Guide utilisateur',
      userGuideDesc: 'Apprenez à utiliser toutes les fonctionnalités du portail',
      apiDocs: 'Documentation API',
      apiDocsDesc: 'Documentation complète pour l\'intégration API',
      support: 'Support technique',
      supportDesc: 'Contactez notre équipe pour toute assistance',
      infoBanner: 'Nouvelles fonctionnalités à venir : Gestion multi-sites, Intégration EDI, et Tableaux de bord personnalisables.',
    },
    common: {
      back: 'Retour',
      next: 'Suivant',
      submit: 'Soumettre',
      cancel: 'Annuler',
      save: 'Enregistrer',
      loading: 'Chargement...',
      close: 'Fermer',
      error: 'Erreur',
    },
  },
  en: {
    languageSelection: {
      title: 'Welcome to UNIVERSAL SHIPPING SERVICES',
      subtitle: 'Choose your preferred language to get started',
      selectLanguage: 'Select your language',
      continue: 'Continue',
      french: 'Français',
      english: 'English',
      spanish: 'Español',
      arabic: 'العربية',
    },
    home: {
      title: 'UNIVERSAL SHIPPING SERVICES',
      subtitle: 'UNIVERSAL SHIPPING SERVICES',
      heroTitle: 'Global Maritime & Logistics Solutions',
      heroSubtitle: 'Connecting Ships, Ports & Businesses Worldwide',
      heroDescription: 'Comprehensive maritime and logistics solutions to connect your operations worldwide.',
      discoverServices: 'Discover our services',
      requestQuote: 'Request a quote',
      requestGlobalQuote: 'Request a global quote',
      talkToExpert: 'Talk to an expert',
      servicesTitle: 'Our main service areas',
      servicesSubtitle: 'Integrated solutions for shipping, logistics and consulting.',
      maritimeShipping: 'Maritime & Shipping',
      maritimeShippingDesc: 'Chartering, ship agency, maritime operations and fleet management for all vessel types.',
      logisticsPortHandling: 'Logistics & Port Handling',
      logisticsPortHandlingDesc: 'Port handling, warehousing, multimodal transport and supply chain management.',
      tradeConsulting: 'Trade & Consulting',
      tradeConsultingDesc: 'International trade consulting, flow optimization and regulatory support.',
      digitalSolutions: 'Digital Maritime Solutions',
      digitalSolutionsDesc: 'Digital platforms, real-time tracking and technology solutions for maritime.',
      viewServices: 'View services',
      coverageTitle: 'Global coverage, from Dakar to Singapore',
      coverageText: 'We operate through a network of agents and partner ports in Africa, Europe, Asia, Americas and Oceania.',
      viewAllPorts: 'View all our ports',
      whyUsTitle: 'Why work with us?',
      whyUs1: '+15 years of maritime & logistics experience',
      whyUs2: 'Global network of agents and partner ports',
      whyUs3: 'Tailored solutions for every supply chain',
      whyUs4: 'Responsive customer support and real-time tracking',
      ctaText: 'Ready to optimize your maritime and logistics operations?',
      ctaButton: 'Talk to an expert',
      globalServices: 'Global Services',
      globalServicesDesc: 'Complete maritime and logistics services',
      portCoverage: 'Port Coverage',
      portCoverageDesc: 'Worldwide network of ports and terminals',
      becomeAgent: 'Become a Global Agent',
      becomeAgentDesc: 'Join our partner network',
      clientSpace: 'Client Space',
      clientSpaceDesc: 'Access your account and track shipments',
      pricing: 'Pricing',
      pricingDesc: 'Get a personalized quote',
      featuredServicesTitle: 'Our Featured Services',
      featuredServicesSubtitle: 'The most requested solutions by our international clients.',
      requestQuoteBtn: 'Request a quote',
      viewPricingBtn: 'View pricing',
      consultExpertBtn: 'Consult an expert',
      accessPortalBtn: 'Access portal',
      profileSolutionsTitle: 'Solutions tailored to your business',
      profileSolutionsSubtitle: 'Discover our services according to your profile',
      profileImportersExporters: 'Importers / Exporters',
      profileImportersPoint1: 'Sea & Air Freight',
      profileImportersPoint2: 'Door-to-Door Solutions',
      profileImportersPoint3: 'Customs & Compliance',
      profileImportersButton: 'Find a service',
      profileShipowners: 'Shipowners / Vessels',
      profileShipownersPoint1: 'Ship Agency',
      profileShipownersPoint2: 'Crew Change',
      profileShipownersPoint3: 'Bunker Supply',
      profileShipownersButton: 'Vessel services',
      profileBusinessB2B: 'Businesses & B2B',
      profileBusinessPoint1: 'Consulting & audits',
      profileBusinessPoint2: 'International sourcing',
      profileBusinessPoint3: 'Digital solutions',
      profileBusinessButton: 'View B2B solutions',
      whyChooseUsTitle: 'Why choose Univers Shipping Services?',
      whyChooseUsAdvantage1Title: 'International coverage',
      whyChooseUsAdvantage1Desc: 'Ports in Africa, Europe, Asia, Americas.',
      whyChooseUsAdvantage2Title: '24/7 Support',
      whyChooseUsAdvantage2Desc: 'Continuous operational assistance.',
      whyChooseUsAdvantage3Title: 'Integrated solutions',
      whyChooseUsAdvantage3Desc: 'Maritime • Logistics • Customs • Digital.',
      whyChooseUsAdvantage4Title: 'Certified experts',
      whyChooseUsAdvantage4Desc: '25+ years of experience.',
      finalCtaTitle: 'Need a customized solution?',
      finalCtaSubtitle: 'Our experts are at your disposal to analyze your needs and propose a tailor-made solution.',
      finalCtaContactExpert: 'Contact an expert',
      finalCtaViewPricing: 'View our pricing',
      mainCta: 'Get a quote in less than 3 minutes',
      mainCtaMicrocopy: 'Fast response guaranteed',
    },
    regions: {
      africa: 'Africa',
      europe: 'Europe',
      asia: 'Asia',
      americas: 'Americas',
      middleEast: 'Middle East',
      oceania: 'Oceania',
    },
    globalServices: {
      title: 'Our Global Services',
      subtitle: 'Maritime, port, logistics and consulting solutions tailored to your international flows.',
      heroTitle: 'Global Maritime & Logistics Services',
      maritime: 'Maritime Services',
      logistics: 'Logistics',
      customs: 'Customs',
      warehousing: 'Warehousing',
      allCategories: 'All',
      maritimeShipping: 'Maritime & Shipping Services',
      logisticsPortHandling: 'Logistics & Port Handling',
      tradeConsulting: 'Trade & Consulting',
      digitalServices: 'Digital Services',
      premium: 'Premium',
      details: 'Details',
      requestOffer: 'Request an offer for this service',
      category: 'Category',
      noServices: 'No services available for this category.',
      loading: 'Loading services...',
      requestQuote: 'Request a quote',
      viewPricing: 'View pricing',
      consultExpert: 'Consult an expert',
      accessPortal: 'Access portal',
      ctaQuote: 'Request an immediate quote',
      ctaPricing: 'View our pricing',
      ctaExpert: 'Talk to an expert',
      ctaPortal: 'Access the digital portal',
    },
    portCoverage: {
      title: 'Our Partner Ports',
      subtitle: 'Global port coverage through our network of local agents.',
      searchPlaceholder: 'Search for a port...',
      allRegions: 'All',
      hub: 'Hub',
      viewDetails: 'View Details',
      services: 'Available Services',
      agents: 'Agents',
      agentsInPort: 'UNIVERSAL SHIPPING SERVICES Agents in this Port',
      noAgents: 'No agents available for this port.',
      premium: 'Premium',
      activities: 'Activities',
      experience: 'Experience',
      years: 'years',
      contact: 'Contact',
      ctaText: 'Do you represent a port or maritime agency?',
      ctaButton: 'Become a partner agent',
      noPorts: 'No ports found for this region.',
      loading: 'Loading ports...',
    },
    becomeAgent: {
      title: 'Become a UNIVERSAL SHIPPING SERVICES Partner Agent',
      subtitle: 'Join the international network of UNIVERSAL SHIPPING SERVICES and represent our services in your port.',
      introduction: 'We are building a global network of maritime agents, logisticians, ship agents and freight forwarders in the world\'s major ports. By becoming a UNIVERSAL SHIPPING SERVICES agent, you benefit from international visibility, B2B client flows and operational support from our headquarters.',
      conditionsTitle: 'Recommended Minimum Conditions',
      condition1: 'Be established in a commercial or industrial port',
      condition2: 'Have at least 2 years of experience in maritime, customs or logistics services',
      condition3: 'Have a dedicated operational team',
      advantagesTitle: 'Advantages for the Agent',
      advantage1: 'Visibility on our global platform',
      advantage2: 'Qualified B2B client recommendations',
      advantage3: 'Collaboration on chartering, ship agency and logistics projects',
      apply: 'Apply Now',
      applicationForm: 'Application Form',
      companyInfo: 'Company Information',
      companyName: 'Company Name',
      companyNamePlaceholder: 'Enter your company name',
      contactName: 'Contact Name',
      contactNamePlaceholder: 'Your full name',
      email: 'Contact Email Address',
      emailPlaceholder: 'your@email.com',
      phone: 'Phone',
      phonePlaceholder: '+1 234 567 8900',
      whatsapp: 'WhatsApp Number',
      whatsappPlaceholder: '+1 234 567 8900',
      website: 'Website (optional)',
      websitePlaceholder: 'https://www.yourwebsite.com',
      portSelection: 'Main Port of Operation',
      selectPort: 'Main Port of Operation',
      searchPort: 'Search for a port...',
      activities: 'Type of Activities',
      selectActivities: 'Select your activities',
      yearsExperience: 'Years of Experience',
      certifications: 'Certificates and Accreditations (ISO, BSC, etc.)',
      certificationsPlaceholder: 'ISO 9001, IATA, BSC, etc.',
      message: 'Message (optional)',
      messagePlaceholder: 'Tell us about your company and experience...',
      submitApplication: 'Submit My Application',
      submitting: 'Submitting...',
      successTitle: 'Thank You!',
      successMessage: 'Your application has been received.\n\nOur teams will analyze your profile and get back to you shortly.',
      backToHome: 'Back to Home',
      errorTitle: 'Error',
      errorMessage: 'An error occurred while submitting your application. Please try again.',
      requiredField: 'This field is required',
      invalidEmail: 'Invalid email',
      selectAtLeastOne: 'Select at least one activity',
      ctaButton: 'Submit my agent application',
      ctaMicrocopy: 'Response within 24–48h',
    },
    clientSpace: {
      title: 'Client Space',
      login: 'Login',
      register: 'Register',
      tracking: 'Tracking',
      documents: 'Documents',
      dashboard: 'Dashboard',
      myProfile: 'My Profile',
      shipments: 'Shipments',
      subscription: 'Subscription',
    },
    pricing: {
      title: 'Plans & Subscriptions',
      subtitle: 'Choose the service level that fits your business.',
      getQuote: 'Request a quote',
      basicTitle: 'Basic Global Access',
      basicPrice: 'Free',
      basicDesc: 'Access to basic information, quote requests and contact with our teams.',
      basicFeature1: 'Access to service catalog',
      basicFeature2: 'Online quote request',
      basicFeature3: 'Standard email contact',
      basicButton: 'Get Started',
      premiumTitle: 'Premium Tracking',
      premiumPrice: '€49 / month',
      premiumDesc: 'Advanced tracking of your shipments and priority support.',
      premiumFeature1: 'Full access to shipment tracking',
      premiumFeature2: 'Email notifications on status changes',
      premiumFeature3: 'Priority support',
      premiumButton: 'Activate this plan now',
      premiumButtonMicrocopy: 'No commitment',
      enterpriseTitle: 'Enterprise Logistics',
      enterprisePrice: '€99 / month',
      enterpriseDesc: 'Global logistics solution for businesses with recurring volumes.',
      enterpriseFeature1: 'All Premium Tracking features',
      enterpriseFeature2: 'Advanced reporting',
      enterpriseFeature3: 'Multi-site management (future option)',
      enterpriseButton: 'Talk to an expert',
      agentTitle: 'Agent Global Listing',
      agentPrice: '€99 / year',
      agentDesc: 'Be visible as an official UNIVERSAL SHIPPING SERVICES agent in your port.',
      agentFeature1: 'Validated and public agent profile',
      agentFeature2: 'Featured on Port Coverage page',
      agentFeature3: '"Premium Agent" badge',
      agentButton: 'Become an agent',
      faqTitle: 'Frequently Asked Questions',
      faqQuestion1: 'Can I change plans at any time?',
      faqAnswer1: 'Yes, you can change plans at any time. The change will take effect immediately and will be prorated according to your billing period.',
      faqQuestion2: 'Are payments secure?',
      faqAnswer2: 'Absolutely. We use secure payment systems compliant with PCI-DSS standards. All transactions are encrypted and your banking data is never stored on our servers.',
      faqQuestion3: 'What is the Digital Maritime Portal?',
      faqAnswer3: 'The Digital Maritime Portal is a comprehensive platform that gives you access to advanced tracking, document management, custom reports, and API integration to automate your operations.',
      faqQuestion4: 'Do plans include 24/7 support?',
      faqAnswer4: '24/7 support is included in Premium Tracking and Enterprise Logistics plans. The Basic plan benefits from email support during business hours.',
      howItWorksTitle: 'How it works?',
    },
    freightQuote: {
      faqTitle: 'Frequently Asked Questions — Quotes & Orders',
      faqQuestion1: 'How does the quote request work?',
      faqAnswer1: 'Simply fill out the form with your cargo details and origin/destination ports. Our team analyzes your request and sends you a detailed quote within 24-48 hours.',
      faqQuestion2: 'How long to receive a quote?',
      faqAnswer2: 'You will receive your personalized quote within 24 to 48 business hours. For urgent requests, contact us directly by phone or WhatsApp.',
      faqQuestion3: 'Can I accept a quote directly online?',
      faqAnswer3: 'Yes! Once you receive your quote, you can accept it directly from your client space. The confirmation process is simple and secure.',
      faqQuestion4: 'Which ports are supported?',
      faqAnswer4: 'We cover over 150 ports worldwide in Africa, Europe, Asia, Americas, and Oceania. Check our "Port Coverage" page to see the complete list.',
      faqQuestion5: 'Is the request free?',
      faqAnswer5: 'Yes, the quote request is completely free and without commitment. You only pay if you accept the proposed quote.',
      howItWorksTitle: 'How it works?',
    },
    becomeAgentFaq: {
      faqTitle: 'Frequently Asked Questions — International Agents',
      faqQuestion1: 'What are the criteria to become an agent?',
      faqAnswer1: 'You must be established in a commercial port, have at least 2 years of experience in maritime or logistics services, and have a dedicated operational team.',
      faqQuestion2: 'What are the benefits for a 3S agent?',
      faqAnswer2: 'International visibility on our platform, qualified B2B client recommendations, collaboration on chartering and logistics projects, and operational support from our headquarters.',
      faqQuestion3: 'How long does validation take?',
      faqAnswer3: 'The validation process typically takes 5 to 10 business days. Our team analyzes your profile, verifies your references, and contacts you to finalize your registration.',
      faqQuestion4: 'What is a Premium Agent Listing?',
      faqAnswer4: 'Premium Agent Listing gives you maximum visibility on our platform with a "Premium" badge, featured placement on the Port Coverage page, and a detailed profile with your certifications and services.',
    },
    howItWorks: {
      step1Title: 'Step 1 — Submit Request',
      step1Desc: 'Select ports, service, and cargo.',
      step2Title: 'Step 2 — Expert Analysis',
      step2Desc: 'Our team studies the request and calculates a rate.',
      step3Title: 'Step 3 — Validation & Payment',
      step3Desc: 'The quote can be accepted directly in the app.',
      step4Title: 'Step 4 — Real-time Tracking',
      step4Desc: 'Access the digital portal to track every step.',
    },
    confidenceBanner: {
      block1Title: '24/7 Support',
      block1Desc: 'Maritime & logistics operational assistance.',
      block2Title: 'Certified Experts',
      block2Desc: '15 years of international experience.',
      block3Title: 'Security & Compliance',
      block3Desc: 'ISPS – Customs – IMO standards.',
      block4Title: 'Priority Processing',
      block4Desc: 'For Premium and Enterprise clients.',
    },
    trustBar: {
      item1: '100% Secure Payment',
      item2: 'Validation within 24–48h',
      item3: 'Immediate access after activation',
      item4: 'Encrypted and protected data',
    },
    microCopies: {
      fastResponse: 'Fast response guaranteed',
      noCommitment: 'No commitment',
      secureOperations: 'Secure operations',
      dataProtected: 'Data protected',
    },
    feedbackMessages: {
      quoteSubmitted: 'Your request has been sent. An expert will respond to you quickly.',
      agentApplicationSubmitted: 'Your application has been submitted. Response within 24–48h.',
      subscriptionActivated: 'Thank you! Your subscription is being activated.',
      documentAdded: 'Document added successfully.',
    },
    digitalPortal: {
      title: 'Digital Maritime Portal',
      welcomeTitle: 'Welcome to Your Digital Portal',
      welcomeSubtitle: 'Access all your maritime and logistics management tools in one place.',
      redirecting: 'Redirecting to pricing page...',
      featuresTitle: 'Portal Features',
      advancedTracking: 'Advanced Tracking',
      advancedTrackingDesc: 'Track your shipments in real-time with detailed updates and automatic notifications.',
      documents: 'Documents & Reports',
      documentsDesc: 'Access all your shipping documents, invoices and custom reports.',
      analytics: 'Analytics & Reporting',
      analyticsDesc: 'Visualize your shipping statistics and generate detailed reports to optimize your operations.',
      apiAccess: 'API Access',
      apiAccessDesc: 'Integrate our services into your systems with our complete and documented REST API.',
      quickActions: 'Quick Actions',
      newQuote: 'New Quote',
      contactSupport: 'Contact Support',
      resources: 'Resources',
      userGuide: 'User Guide',
      userGuideDesc: 'Learn how to use all portal features',
      apiDocs: 'API Documentation',
      apiDocsDesc: 'Complete documentation for API integration',
      support: 'Technical Support',
      supportDesc: 'Contact our team for any assistance',
      infoBanner: 'Coming soon: Multi-site management, EDI Integration, and Customizable dashboards.',
    },
    common: {
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      loading: 'Loading...',
      close: 'Close',
      error: 'Error',
    },
  },
  es: {
    languageSelection: {
      title: 'Bienvenido a UNIVERSAL SHIPPING SERVICES',
      subtitle: 'Elija su idioma preferido para comenzar',
      selectLanguage: 'Seleccione su idioma',
      continue: 'Continuar',
      french: 'Français',
      english: 'English',
      spanish: 'Español',
      arabic: 'العربية',
    },
    home: {
      title: 'UNIVERSAL SHIPPING SERVICES',
      subtitle: 'UNIVERSAL SHIPPING SERVICES',
      heroTitle: 'Global Maritime & Logistics Solutions',
      heroSubtitle: 'Connecting Ships, Ports & Businesses Worldwide',
      heroDescription: 'Soluciones marítimas y logísticas integrales para conectar sus operaciones en todo el mundo.',
      discoverServices: 'Descubrir nuestros servicios',
      requestQuote: 'Solicitar cotización',
      requestGlobalQuote: 'Solicitar cotización global',
      talkToExpert: 'Hablar con un experto',
      servicesTitle: 'Nuestras principales áreas de servicio',
      servicesSubtitle: 'Soluciones integradas para el transporte marítimo, la logística y la consultoría.',
      maritimeShipping: 'Maritime & Shipping',
      maritimeShippingDesc: 'Fletamento, consignación, operaciones marítimas y gestión de flotas para todo tipo de buques.',
      logisticsPortHandling: 'Logistics & Port Handling',
      logisticsPortHandlingDesc: 'Manipulación portuaria, almacenamiento, transporte multimodal y gestión de la cadena de suministro.',
      tradeConsulting: 'Trade & Consulting',
      tradeConsultingDesc: 'Consultoría de comercio internacional, optimización de flujos y apoyo regulatorio.',
      digitalSolutions: 'Digital Maritime Solutions',
      digitalSolutionsDesc: 'Plataformas digitales, seguimiento en tiempo real y soluciones tecnológicas para el marítimo.',
      viewServices: 'Ver servicios',
      coverageTitle: 'Cobertura global, de Dakar a Singapur',
      coverageText: 'Operamos a través de una red de agentes y puertos asociados en África, Europa, Asia, Américas y Oceanía.',
      viewAllPorts: 'Ver todos nuestros puertos',
      whyUsTitle: '¿Por qué trabajar con nosotros?',
      whyUs1: '+15 años de experiencia marítima y logística',
      whyUs2: 'Red global de agentes y puertos asociados',
      whyUs3: 'Soluciones a medida para cada cadena de suministro',
      whyUs4: 'Soporte al cliente receptivo y seguimiento en tiempo real',
      ctaText: '¿Listo para optimizar sus operaciones marítimas y logísticas?',
      ctaButton: 'Hablar con un experto',
      globalServices: 'Servicios Globales',
      globalServicesDesc: 'Servicios marítimos y logísticos completos',
      portCoverage: 'Cobertura Portuaria',
      portCoverageDesc: 'Red mundial de puertos y terminales',
      becomeAgent: 'Conviértete en Agente Global',
      becomeAgentDesc: 'Únete a nuestra red de socios',
      clientSpace: 'Espacio Cliente',
      clientSpaceDesc: 'Accede a tu cuenta y rastrea envíos',
      pricing: 'Precios',
      pricingDesc: 'Obtén una cotización personalizada',
      featuredServicesTitle: 'Nuestros Servicios Destacados',
      featuredServicesSubtitle: 'Las soluciones más solicitadas por nuestros clientes internacionales.',
      requestQuoteBtn: 'Solicitar cotización',
      viewPricingBtn: 'Ver precios',
      consultExpertBtn: 'Consultar un experto',
      accessPortalBtn: 'Acceder al portal',
      profileSolutionsTitle: 'Soluciones adaptadas a su negocio',
      profileSolutionsSubtitle: 'Descubra nuestros servicios según su perfil',
      profileImportersExporters: 'Importadores / Exportadores',
      profileImportersPoint1: 'Flete marítimo y aéreo',
      profileImportersPoint2: 'Soluciones puerta a puerta',
      profileImportersPoint3: 'Aduanas y cumplimiento',
      profileImportersButton: 'Encontrar un servicio',
      profileShipowners: 'Armadores / Buques',
      profileShipownersPoint1: 'Agencia de buques',
      profileShipownersPoint2: 'Cambio de tripulación',
      profileShipownersPoint3: 'Suministro de combustible',
      profileShipownersButton: 'Servicios de buques',
      profileBusinessB2B: 'Empresas y B2B',
      profileBusinessPoint1: 'Consultoría y auditorías',
      profileBusinessPoint2: 'Sourcing internacional',
      profileBusinessPoint3: 'Soluciones digitales',
      profileBusinessButton: 'Ver soluciones B2B',
      whyChooseUsTitle: '¿Por qué elegir Univers Shipping Services?',
      whyChooseUsAdvantage1Title: 'Cobertura internacional',
      whyChooseUsAdvantage1Desc: 'Puertos en África, Europa, Asia, Américas.',
      whyChooseUsAdvantage2Title: 'Soporte 24/7',
      whyChooseUsAdvantage2Desc: 'Asistencia operacional continua.',
      whyChooseUsAdvantage3Title: 'Soluciones integradas',
      whyChooseUsAdvantage3Desc: 'Marítimo • Logística • Aduanas • Digital.',
      whyChooseUsAdvantage4Title: 'Expertos certificados',
      whyChooseUsAdvantage4Desc: '25+ años de experiencia.',
      finalCtaTitle: '¿Necesita una solución personalizada?',
      finalCtaSubtitle: 'Nuestros expertos están a su disposición para analizar sus necesidades y proponer una solución a medida.',
      finalCtaContactExpert: 'Contactar a un experto',
      finalCtaViewPricing: 'Ver nuestros precios',
      mainCta: 'Obtener una cotización en menos de 3 minutos',
      mainCtaMicrocopy: 'Respuesta rápida garantizada',
    },
    regions: {
      africa: 'África',
      europe: 'Europa',
      asia: 'Asia',
      americas: 'Américas',
      middleEast: 'Medio Oriente',
      oceania: 'Oceanía',
    },
    globalServices: {
      title: 'Nuestros Servicios Globales',
      subtitle: 'Soluciones marítimas, portuarias, logísticas y de consultoría adaptadas a sus flujos internacionales.',
      heroTitle: 'Servicios Marítimos y Logísticos Globales',
      maritime: 'Servicios Marítimos',
      logistics: 'Logística',
      customs: 'Aduanas',
      warehousing: 'Almacenamiento',
      allCategories: 'Todos',
      maritimeShipping: 'Maritime & Shipping Services',
      logisticsPortHandling: 'Logistics & Port Handling',
      tradeConsulting: 'Trade & Consulting',
      digitalServices: 'Digital Services',
      premium: 'Premium',
      details: 'Detalles',
      requestOffer: 'Solicitar una oferta para este servicio',
      category: 'Categoría',
      noServices: 'No hay servicios disponibles para esta categoría.',
      loading: 'Cargando servicios...',
      requestQuote: 'Solicitar cotización',
      viewPricing: 'Ver precios',
      consultExpert: 'Consultar un experto',
      accessPortal: 'Acceder al portal',
      ctaQuote: 'Solicitar una cotización inmediata',
      ctaPricing: 'Ver nuestros precios',
      ctaExpert: 'Hablar con un experto',
      ctaPortal: 'Acceder al portal digital',
    },
    portCoverage: {
      title: 'Nuestros Puertos Asociados',
      subtitle: 'Cobertura portuaria global a través de nuestra red de agentes locales.',
      searchPlaceholder: 'Buscar un puerto...',
      allRegions: 'Todos',
      hub: 'Hub',
      viewDetails: 'Ver Detalles',
      services: 'Servicios Disponibles',
      agents: 'Agentes',
      agentsInPort: 'Agentes UNIVERSAL SHIPPING SERVICES en este Puerto',
      noAgents: 'No hay agentes disponibles para este puerto.',
      premium: 'Premium',
      activities: 'Actividades',
      experience: 'Experiencia',
      years: 'años',
      contact: 'Contacto',
      ctaText: '¿Representa un puerto o agencia marítima?',
      ctaButton: 'Conviértete en agente asociado',
      noPorts: 'No se encontraron puertos para esta región.',
      loading: 'Cargando puertos...',
    },
    becomeAgent: {
      title: 'Conviértete en Agente Asociado UNIVERSAL SHIPPING SERVICES',
      subtitle: 'Únete a la red internacional de UNIVERSAL SHIPPING SERVICES y representa nuestros servicios en tu puerto.',
      introduction: 'Estamos construyendo una red global de agentes marítimos, logísticos, consignatarios y transitarios en los principales puertos del mundo. Al convertirte en agente UNIVERSAL SHIPPING SERVICES, te beneficias de visibilidad internacional, flujos de clientes B2B y soporte operacional desde nuestra sede.',
      conditionsTitle: 'Condiciones Mínimas Recomendadas',
      condition1: 'Estar establecido en un puerto comercial o industrial',
      condition2: 'Tener al menos 2 años de experiencia en servicios marítimos, aduaneros o logísticos',
      condition3: 'Disponer de un equipo operacional dedicado',
      advantagesTitle: 'Ventajas para el Agente',
      advantage1: 'Visibilidad en nuestra plataforma global',
      advantage2: 'Recomendaciones de clientes B2B calificados',
      advantage3: 'Colaboración en proyectos de fletamento, consignación y logística',
      apply: 'Aplicar Ahora',
      applicationForm: 'Formulario de Solicitud',
      companyInfo: 'Información de la Empresa',
      companyName: 'Nombre de la Empresa',
      companyNamePlaceholder: 'Ingrese el nombre de su empresa',
      contactName: 'Nombre de Contacto',
      contactNamePlaceholder: 'Su nombre completo',
      email: 'Dirección de Correo Electrónico de Contacto',
      emailPlaceholder: 'su@email.com',
      phone: 'Teléfono',
      phonePlaceholder: '+34 612 345 678',
      whatsapp: 'Número de WhatsApp',
      whatsappPlaceholder: '+34 612 345 678',
      website: 'Sitio Web (opcional)',
      websitePlaceholder: 'https://www.suempresa.com',
      portSelection: 'Puerto Principal de Operación',
      selectPort: 'Puerto Principal de Operación',
      searchPort: 'Buscar un puerto...',
      activities: 'Tipo de Actividades',
      selectActivities: 'Seleccione sus actividades',
      yearsExperience: 'Años de Experiencia',
      certifications: 'Certificados y Acreditaciones (ISO, BSC, etc.)',
      certificationsPlaceholder: 'ISO 9001, IATA, BSC, etc.',
      message: 'Mensaje (opcional)',
      messagePlaceholder: 'Cuéntenos sobre su empresa y experiencia...',
      submitApplication: 'Enviar Mi Solicitud',
      submitting: 'Enviando...',
      successTitle: '¡Gracias!',
      successMessage: 'Su solicitud ha sido recibida.\n\nNuestros equipos analizarán su perfil y se pondrán en contacto con usted en breve.',
      backToHome: 'Volver al Inicio',
      errorTitle: 'Error',
      errorMessage: 'Ocurrió un error al enviar su solicitud. Por favor, inténtelo de nuevo.',
      requiredField: 'Este campo es obligatorio',
      invalidEmail: 'Correo electrónico inválido',
      selectAtLeastOne: 'Seleccione al menos una actividad',
      ctaButton: 'Enviar mi solicitud de agente',
      ctaMicrocopy: 'Respuesta en 24–48h',
    },
    clientSpace: {
      title: 'Espacio Cliente',
      login: 'Iniciar sesión',
      register: 'Registrarse',
      tracking: 'Seguimiento',
      documents: 'Documentos',
      dashboard: 'Panel de control',
      myProfile: 'Mi perfil',
      shipments: 'Envíos',
      subscription: 'Suscripción',
    },
    pricing: {
      title: 'Planes y Suscripciones',
      subtitle: 'Elija el nivel de servicio que se adapte a su negocio.',
      getQuote: 'Solicitar cotización',
      basicTitle: 'Basic Global Access',
      basicPrice: 'Gratis',
      basicDesc: 'Acceso a información básica, solicitudes de cotización y contacto con nuestros equipos.',
      basicFeature1: 'Acceso al catálogo de servicios',
      basicFeature2: 'Solicitud de cotización en línea',
      basicFeature3: 'Contacto por correo electrónico estándar',
      basicButton: 'Comenzar',
      premiumTitle: 'Premium Tracking',
      premiumPrice: '€49 / mes',
      premiumDesc: 'Seguimiento avanzado de sus envíos y soporte prioritario.',
      premiumFeature1: 'Acceso completo al seguimiento de envíos',
      premiumFeature2: 'Notificaciones por correo electrónico sobre cambios de estado',
      premiumFeature3: 'Soporte prioritario',
      premiumButton: 'Activar este plan ahora',
      premiumButtonMicrocopy: 'Sin compromiso',
      enterpriseTitle: 'Enterprise Logistics',
      enterprisePrice: '€99 / mes',
      enterpriseDesc: 'Solución logística global para empresas con volúmenes recurrentes.',
      enterpriseFeature1: 'Todas las funciones de Premium Tracking',
      enterpriseFeature2: 'Informes avanzados',
      enterpriseFeature3: 'Gestión multisitio (opción futura)',
      enterpriseButton: 'Hablar con un experto',
      agentTitle: 'Agent Global Listing',
      agentPrice: '€99 / año',
      agentDesc: 'Sea visible como agente oficial de UNIVERSAL SHIPPING SERVICES en su puerto.',
      agentFeature1: 'Perfil de agente validado y público',
      agentFeature2: 'Destacado en la página de Cobertura Portuaria',
      agentFeature3: 'Insignia de "Agente Premium"',
      agentButton: 'Convertirse en agente',
      faqTitle: 'Preguntas Frecuentes',
      faqQuestion1: '¿Puedo cambiar de plan en cualquier momento?',
      faqAnswer1: 'Sí, puede cambiar de plan en cualquier momento. El cambio tendrá efecto inmediato y se prorrateará según su período de facturación.',
      faqQuestion2: '¿Son seguros los pagos?',
      faqAnswer2: 'Absolutamente. Utilizamos sistemas de pago seguros conformes con los estándares PCI-DSS. Todas las transacciones están encriptadas y sus datos bancarios nunca se almacenan en nuestros servidores.',
      faqQuestion3: '¿Qué es el Digital Maritime Portal?',
      faqAnswer3: 'El Digital Maritime Portal es una plataforma completa que le da acceso a seguimiento avanzado, gestión de documentos, informes personalizados e integración API para automatizar sus operaciones.',
      faqQuestion4: '¿Los planes incluyen soporte 24/7?',
      faqAnswer4: 'El soporte 24/7 está incluido en los planes Premium Tracking y Enterprise Logistics. El plan Basic cuenta con soporte por correo electrónico en horario laboral.',
      howItWorksTitle: '¿Cómo funciona?',
    },
    freightQuote: {
      faqTitle: 'Preguntas Frecuentes — Cotizaciones y Pedidos',
      faqQuestion1: '¿Cómo funciona la solicitud de cotización?',
      faqAnswer1: 'Simplemente complete el formulario con los detalles de su carga y puertos de origen/destino. Nuestro equipo analiza su solicitud y le envía una cotización detallada en 24-48 horas.',
      faqQuestion2: '¿Cuánto tiempo para recibir una cotización?',
      faqAnswer2: 'Recibirá su cotización personalizada en 24 a 48 horas hábiles. Para solicitudes urgentes, contáctenos directamente por teléfono o WhatsApp.',
      faqQuestion3: '¿Puedo aceptar una cotización directamente en línea?',
      faqAnswer3: '¡Sí! Una vez que reciba su cotización, puede aceptarla directamente desde su espacio de cliente. El proceso de confirmación es simple y seguro.',
      faqQuestion4: '¿Qué puertos están soportados?',
      faqAnswer4: 'Cubrimos más de 150 puertos en todo el mundo en África, Europa, Asia, Américas y Oceanía. Consulte nuestra página "Cobertura Portuaria" para ver la lista completa.',
      faqQuestion5: '¿La solicitud es gratuita?',
      faqAnswer5: 'Sí, la solicitud de cotización es completamente gratuita y sin compromiso. Solo paga si acepta la cotización propuesta.',
      howItWorksTitle: '¿Cómo funciona?',
    },
    becomeAgentFaq: {
      faqTitle: 'Preguntas Frecuentes — Agentes Internacionales',
      faqQuestion1: '¿Cuáles son los criterios para convertirse en agente?',
      faqAnswer1: 'Debe estar establecido en un puerto comercial, tener al menos 2 años de experiencia en servicios marítimos o logísticos, y contar con un equipo operacional dedicado.',
      faqQuestion2: '¿Cuáles son los beneficios para un agente 3S?',
      faqAnswer2: 'Visibilidad internacional en nuestra plataforma, recomendaciones de clientes B2B calificados, colaboración en proyectos de fletamento y logística, y soporte operacional desde nuestra sede.',
      faqQuestion3: '¿Cuánto tiempo tarda la validación?',
      faqAnswer3: 'El proceso de validación generalmente toma de 5 a 10 días hábiles. Nuestro equipo analiza su perfil, verifica sus referencias y se comunica con usted para finalizar su registro.',
      faqQuestion4: '¿Qué es un Premium Agent Listing?',
      faqAnswer4: 'El Premium Agent Listing le brinda máxima visibilidad en nuestra plataforma con una insignia "Premium", ubicación destacada en la página de Cobertura Portuaria y un perfil detallado con sus certificaciones y servicios.',
    },
    howItWorks: {
      step1Title: 'Paso 1 — Enviar Solicitud',
      step1Desc: 'Seleccione puertos, servicio y carga.',
      step2Title: 'Paso 2 — Análisis Experto',
      step2Desc: 'Nuestro equipo estudia la solicitud y calcula una tarifa.',
      step3Title: 'Paso 3 — Validación y Pago',
      step3Desc: 'La cotización puede ser aceptada directamente en la app.',
      step4Title: 'Paso 4 — Seguimiento en Tiempo Real',
      step4Desc: 'Acceda al portal digital para seguir cada paso.',
    },
    confidenceBanner: {
      block1Title: 'Soporte 24/7',
      block1Desc: 'Asistencia operacional marítima y logística.',
      block2Title: 'Expertos certificados',
      block2Desc: '15 años de experiencia internacional.',
      block3Title: 'Seguridad y cumplimiento',
      block3Desc: 'Estándares ISPS – Aduanas – IMO.',
      block4Title: 'Procesamiento prioritario',
      block4Desc: 'Para clientes Premium y Enterprise.',
    },
    trustBar: {
      item1: 'Pago 100% seguro',
      item2: 'Validación en 24–48h',
      item3: 'Acceso inmediato después de la activación',
      item4: 'Datos cifrados y protegidos',
    },
    microCopies: {
      fastResponse: 'Respuesta rápida garantizada',
      noCommitment: 'Sin compromiso',
      secureOperations: 'Operaciones seguras',
      dataProtected: 'Datos protegidos',
    },
    feedbackMessages: {
      quoteSubmitted: 'Su solicitud ha sido enviada. Un experto le responderá rápidamente.',
      agentApplicationSubmitted: 'Su solicitud ha sido enviada. Respuesta en 24–48h.',
      subscriptionActivated: '¡Gracias! Su suscripción está siendo activada.',
      documentAdded: 'Documento agregado con éxito.',
    },
    digitalPortal: {
      title: 'Portal Digital Marítimo',
      welcomeTitle: 'Bienvenido a su Portal Digital',
      welcomeSubtitle: 'Acceda a todas sus herramientas de gestión marítima y logística en un solo lugar.',
      redirecting: 'Redirigiendo a la página de precios...',
      featuresTitle: 'Características del Portal',
      advancedTracking: 'Seguimiento Avanzado',
      advancedTrackingDesc: 'Rastree sus envíos en tiempo real con actualizaciones detalladas y notificaciones automáticas.',
      documents: 'Documentos e Informes',
      documentsDesc: 'Acceda a todos sus documentos de envío, facturas e informes personalizados.',
      analytics: 'Análisis e Informes',
      analyticsDesc: 'Visualice sus estadísticas de envío y genere informes detallados para optimizar sus operaciones.',
      apiAccess: 'Acceso API',
      apiAccessDesc: 'Integre nuestros servicios en sus sistemas con nuestra API REST completa y documentada.',
      quickActions: 'Acciones Rápidas',
      newQuote: 'Nueva Cotización',
      contactSupport: 'Contactar Soporte',
      resources: 'Recursos',
      userGuide: 'Guía del Usuario',
      userGuideDesc: 'Aprenda a usar todas las funciones del portal',
      apiDocs: 'Documentación API',
      apiDocsDesc: 'Documentación completa para la integración API',
      support: 'Soporte Técnico',
      supportDesc: 'Contacte a nuestro equipo para cualquier asistencia',
      infoBanner: 'Próximamente: Gestión multisitio, Integración EDI y Paneles personalizables.',
    },
    common: {
      back: 'Atrás',
      next: 'Siguiente',
      submit: 'Enviar',
      cancel: 'Cancelar',
      save: 'Guardar',
      loading: 'Cargando...',
      close: 'Cerrar',
      error: 'Error',
    },
  },
  ar: {
    languageSelection: {
      title: 'مرحبًا بك في UNIVERSAL SHIPPING SERVICES',
      subtitle: 'اختر لغتك المفضلة للبدء',
      selectLanguage: 'اختر لغتك',
      continue: 'متابعة',
      french: 'Français',
      english: 'English',
      spanish: 'Español',
      arabic: 'العربية',
    },
    home: {
      title: 'UNIVERSAL SHIPPING SERVICES',
      subtitle: 'خدمات الشحن العالمية',
      heroTitle: 'Global Maritime & Logistics Solutions',
      heroSubtitle: 'Connecting Ships, Ports & Businesses Worldwide',
      heroDescription: 'حلول بحرية ولوجستية شاملة لربط عملياتك في جميع أنحاء العالم.',
      discoverServices: 'اكتشف خدماتنا',
      requestQuote: 'طلب عرض أسعار',
      requestGlobalQuote: 'طلب عرض أسعار عالمي',
      talkToExpert: 'تحدث إلى خبير',
      servicesTitle: 'مجالات خدماتنا الرئيسية',
      servicesSubtitle: 'حلول متكاملة للشحن واللوجستيات والاستشارات.',
      maritimeShipping: 'Maritime & Shipping',
      maritimeShippingDesc: 'التأجير والوكالة البحرية والعمليات البحرية وإدارة الأسطول لجميع أنواع السفن.',
      logisticsPortHandling: 'Logistics & Port Handling',
      logisticsPortHandlingDesc: 'المناولة الميناء والتخزين والنقل متعدد الوسائط وإدارة سلسلة التوريد.',
      tradeConsulting: 'Trade & Consulting',
      tradeConsultingDesc: 'استشارات التجارة الدولية وتحسين التدفقات والدعم التنظيمي.',
      digitalSolutions: 'Digital Maritime Solutions',
      digitalSolutionsDesc: 'المنصات الرقمية والتتبع في الوقت الفعلي والحلول التكنولوجية للبحرية.',
      viewServices: 'عرض الخدمات',
      coverageTitle: 'تغطية عالمية، من داكار إلى سنغافورة',
      coverageText: 'نعمل من خلال شبكة من الوكلاء والموانئ الشريكة في أفريقيا وأوروبا وآسيا والأمريكتين وأوقيانوسيا.',
      viewAllPorts: 'عرض جميع موانئنا',
      whyUsTitle: 'لماذا تعمل معنا؟',
      whyUs1: '+15 سنة من الخبرة البحرية واللوجستية',
      whyUs2: 'شبكة عالمية من الوكلاء والموانئ الشريكة',
      whyUs3: 'حلول مخصصة لكل سلسلة توريد',
      whyUs4: 'دعم العملاء المستجيب والتتبع في الوقت الفعلي',
      ctaText: 'هل أنت مستعد لتحسين عملياتك البحرية واللوجستية؟',
      ctaButton: 'تحدث إلى خبير',
      globalServices: 'الخدمات العالمية',
      globalServicesDesc: 'خدمات بحرية ولوجستية شاملة',
      portCoverage: 'التغطية الميناء',
      portCoverageDesc: 'شبكة عالمية من الموانئ والمحطات',
      becomeAgent: 'كن وكيلاً عالمياً',
      becomeAgentDesc: 'انضم إلى شبكة شركائنا',
      clientSpace: 'مساحة العميل',
      clientSpaceDesc: 'الوصول إلى حسابك وتتبع الشحنات',
      pricing: 'التسعير',
      pricingDesc: 'احصل على عرض أسعار مخصص',
      featuredServicesTitle: 'خدماتنا المميزة',
      featuredServicesSubtitle: 'الحلول الأكثر طلبًا من قبل عملائنا الدوليين.',
      requestQuoteBtn: 'طلب عرض أسعار',
      viewPricingBtn: 'عرض الأسعار',
      consultExpertBtn: 'استشارة خبير',
      accessPortalBtn: 'الوصول إلى البوابة',
      profileSolutionsTitle: 'حلول مصممة لعملك',
      profileSolutionsSubtitle: 'اكتشف خدماتنا حسب ملفك الشخصي',
      profileImportersExporters: 'المستوردون / المصدرون',
      profileImportersPoint1: 'الشحن البحري والجوي',
      profileImportersPoint2: 'حلول من الباب إلى الباب',
      profileImportersPoint3: 'الجمارك والامتثال',
      profileImportersButton: 'العثور على خدمة',
      profileShipowners: 'مالكو السفن / السفن',
      profileShipownersPoint1: 'وكالة السفن',
      profileShipownersPoint2: 'تغيير الطاقم',
      profileShipownersPoint3: 'إمداد الوقود',
      profileShipownersButton: 'خدمات السفن',
      profileBusinessB2B: 'الشركات و B2B',
      profileBusinessPoint1: 'الاستشارات والتدقيق',
      profileBusinessPoint2: 'التوريد الدولي',
      profileBusinessPoint3: 'الحلول الرقمية',
      profileBusinessButton: 'عرض حلول B2B',
      whyChooseUsTitle: 'لماذا تختار Univers Shipping Services؟',
      whyChooseUsAdvantage1Title: 'تغطية دولية',
      whyChooseUsAdvantage1Desc: 'موانئ في أفريقيا وأوروبا وآسيا والأمريكتين.',
      whyChooseUsAdvantage2Title: 'دعم 24/7',
      whyChooseUsAdvantage2Desc: 'مساعدة تشغيلية مستمرة.',
      whyChooseUsAdvantage3Title: 'حلول متكاملة',
      whyChooseUsAdvantage3Desc: 'بحري • لوجستي • جمارك • رقمي.',
      whyChooseUsAdvantage4Title: 'خبراء معتمدون',
      whyChooseUsAdvantage4Desc: '25+ سنة من الخبرة.',
      finalCtaTitle: 'هل تحتاج إلى حل مخصص؟',
      finalCtaSubtitle: 'خبراؤنا تحت تصرفك لتحليل احتياجاتك واقتراح حل مصمم خصيصًا.',
      finalCtaContactExpert: 'اتصل بخبير',
      finalCtaViewPricing: 'عرض أسعارنا',
      mainCta: 'احصل على عرض أسعار في أقل من 3 دقائق',
      mainCtaMicrocopy: 'استجابة سريعة مضمونة',
    },
    regions: {
      africa: 'أفريقيا',
      europe: 'أوروبا',
      asia: 'آسيا',
      americas: 'الأمريكتين',
      middleEast: 'الشرق الأوسط',
      oceania: 'أوقيانوسيا',
    },
    globalServices: {
      title: 'خدماتنا العالمية',
      subtitle: 'حلول بحرية وميناء ولوجستية واستشارية مصممة لتدفقاتك الدولية.',
      heroTitle: 'الخدمات البحرية واللوجستية العالمية',
      maritime: 'الخدمات البحرية',
      logistics: 'اللوجستيات',
      customs: 'الجمارك',
      warehousing: 'التخزين',
      allCategories: 'الكل',
      maritimeShipping: 'Maritime & Shipping Services',
      logisticsPortHandling: 'Logistics & Port Handling',
      tradeConsulting: 'Trade & Consulting',
      digitalServices: 'Digital Services',
      premium: 'بريميوم',
      details: 'التفاصيل',
      requestOffer: 'طلب عرض لهذه الخدمة',
      category: 'الفئة',
      noServices: 'لا توجد خدمات متاحة لهذه الفئة.',
      loading: 'جار تحميل الخدمات...',
      requestQuote: 'طلب عرض أسعار',
      viewPricing: 'عرض الأسعار',
      consultExpert: 'استشارة خبير',
      accessPortal: 'الوصول إلى البوابة',
      ctaQuote: 'طلب عرض أسعار فوري',
      ctaPricing: 'عرض أسعارنا',
      ctaExpert: 'تحدث إلى خبير',
      ctaPortal: 'الوصول إلى البوابة الرقمية',
    },
    portCoverage: {
      title: 'موانئنا الشريكة',
      subtitle: 'تغطية ميناء عالمية من خلال شبكة وكلائنا المحليين.',
      searchPlaceholder: 'البحث عن ميناء...',
      allRegions: 'الكل',
      hub: 'مركز',
      viewDetails: 'عرض التفاصيل',
      services: 'الخدمات المتاحة',
      agents: 'الوكلاء',
      agentsInPort: 'وكلاء UNIVERSAL SHIPPING SERVICES في هذا الميناء',
      noAgents: 'لا يوجد وكلاء متاحون لهذا الميناء.',
      premium: 'بريميوم',
      activities: 'الأنشطة',
      experience: 'الخبرة',
      years: 'سنوات',
      contact: 'اتصال',
      ctaText: 'هل تمثل ميناء أو وكالة بحرية؟',
      ctaButton: 'كن وكيلاً شريكاً',
      noPorts: 'لم يتم العثور على موانئ لهذه المنطقة.',
      loading: 'جار تحميل الموانئ...',
    },
    becomeAgent: {
      title: 'كن وكيلاً شريكاً UNIVERSAL SHIPPING SERVICES',
      subtitle: 'انضم إلى الشبكة الدولية لخدمات الشحن العالمية ومثل خدماتنا في ميناءك.',
      introduction: 'نحن نبني شبكة عالمية من الوكلاء البحريين واللوجستيين والوكلاء البحريين ووكلاء الشحن في الموانئ الرئيسية في العالم. من خلال أن تصبح وكيلاً UNIVERSAL SHIPPING SERVICES، تستفيد من الرؤية الدولية وتدفقات العملاء B2B والدعم التشغيلي من مقرنا الرئيسي.',
      conditionsTitle: 'الشروط الدنيا الموصى بها',
      condition1: 'أن تكون مؤسسة في ميناء تجاري أو صناعي',
      condition2: 'أن يكون لديك خبرة لا تقل عن سنتين في الخدمات البحرية أو الجمركية أو اللوجستية',
      condition3: 'أن يكون لديك فريق تشغيلي مخصص',
      advantagesTitle: 'مزايا الوكيل',
      advantage1: 'الرؤية على منصتنا العالمية',
      advantage2: 'توصيات العملاء B2B المؤهلين',
      advantage3: 'التعاون في مشاريع التأجير والوكالة البحرية واللوجستيات',
      apply: 'تقديم الطلب الآن',
      applicationForm: 'نموذج الطلب',
      companyInfo: 'معلومات الشركة',
      companyName: 'اسم الشركة',
      companyNamePlaceholder: 'أدخل اسم شركتك',
      contactName: 'اسم جهة الاتصال',
      contactNamePlaceholder: 'اسمك الكامل',
      email: 'عنوان البريد الإلكتروني للاتصال',
      emailPlaceholder: 'your@email.com',
      phone: 'الهاتف',
      phonePlaceholder: '+966 50 123 4567',
      whatsapp: 'رقم واتساب',
      whatsappPlaceholder: '+966 50 123 4567',
      website: 'الموقع الإلكتروني (اختياري)',
      websitePlaceholder: 'https://www.yourwebsite.com',
      portSelection: 'الميناء الرئيسي للعمليات',
      selectPort: 'الميناء الرئيسي للعمليات',
      searchPort: 'البحث عن ميناء...',
      activities: 'نوع الأنشطة',
      selectActivities: 'اختر أنشطتك',
      yearsExperience: 'سنوات الخبرة',
      certifications: 'الشهادات والاعتمادات (ISO، BSC، إلخ.)',
      certificationsPlaceholder: 'ISO 9001, IATA, BSC, إلخ.',
      message: 'رسالة (اختياري)',
      messagePlaceholder: 'أخبرنا عن شركتك وخبرتك...',
      submitApplication: 'إرسال طلبي',
      submitting: 'جاري الإرسال...',
      successTitle: 'شكراً!',
      successMessage: 'تم استلام طلبك.\n\nسيقوم فريقنا بتحليل ملفك الشخصي والعودة إليك قريباً.',
      backToHome: 'العودة إلى الصفحة الرئيسية',
      errorTitle: 'خطأ',
      errorMessage: 'حدث خطأ أثناء إرسال طلبك. يرجى المحاولة مرة أخرى.',
      requiredField: 'هذا الحقل مطلوب',
      invalidEmail: 'بريد إلكتروني غير صالح',
      selectAtLeastOne: 'اختر نشاطاً واحداً على الأقل',
      ctaButton: 'إرسال طلب الوكيل الخاص بي',
      ctaMicrocopy: 'الرد في غضون 24-48 ساعة',
    },
    clientSpace: {
      title: 'مساحة العميل',
      login: 'تسجيل الدخول',
      register: 'التسجيل',
      tracking: 'التتبع',
      documents: 'المستندات',
      dashboard: 'لوحة التحكم',
      myProfile: 'ملفي الشخصي',
      shipments: 'الشحنات',
      subscription: 'الاشتراك',
    },
    pricing: {
      title: 'الخطط والاشتراكات',
      subtitle: 'اختر مستوى الخدمة الذي يناسب عملك.',
      getQuote: 'طلب عرض أسعار',
      basicTitle: 'Basic Global Access',
      basicPrice: 'مجاني',
      basicDesc: 'الوصول إلى المعلومات الأساسية وطلبات الأسعار والاتصال بفرقنا.',
      basicFeature1: 'الوصول إلى كتالوج الخدمات',
      basicFeature2: 'طلب عرض أسعار عبر الإنترنت',
      basicFeature3: 'اتصال بريد إلكتروني قياسي',
      basicButton: 'ابدأ',
      premiumTitle: 'Premium Tracking',
      premiumPrice: '€49 / شهر',
      premiumDesc: 'تتبع متقدم لشحناتك ودعم ذو أولوية.',
      premiumFeature1: 'وصول كامل لتتبع الشحنات',
      premiumFeature2: 'إشعارات البريد الإلكتروني عند تغيير الحالة',
      premiumFeature3: 'دعم ذو أولوية',
      premiumButton: 'تفعيل هذه الخطة الآن',
      premiumButtonMicrocopy: 'بدون التزام',
      enterpriseTitle: 'Enterprise Logistics',
      enterprisePrice: '€99 / شهر',
      enterpriseDesc: 'حل لوجستي عالمي للشركات ذات الأحجام المتكررة.',
      enterpriseFeature1: 'جميع ميزات Premium Tracking',
      enterpriseFeature2: 'تقارير متقدمة',
      enterpriseFeature3: 'إدارة متعددة المواقع (خيار مستقبلي)',
      enterpriseButton: 'تحدث إلى خبير',
      agentTitle: 'Agent Global Listing',
      agentPrice: '€99 / سنة',
      agentDesc: 'كن مرئيًا كوكيل رسمي لـ UNIVERSAL SHIPPING SERVICES في ميناءك.',
      agentFeature1: 'ملف تعريف وكيل معتمد وعام',
      agentFeature2: 'مميز في صفحة التغطية الميناء',
      agentFeature3: 'شارة "وكيل بريميوم"',
      agentButton: 'كن وكيلاً',
      faqTitle: 'الأسئلة الشائعة',
      faqQuestion1: 'هل يمكنني تغيير الخطة في أي وقت؟',
      faqAnswer1: 'نعم، يمكنك تغيير الخطط في أي وقت. سيدخل التغيير حيز التنفيذ على الفور وسيتم تقسيمه بالتناسب وفقًا لفترة الفوترة الخاصة بك.',
      faqQuestion2: 'هل المدفوعات آمنة؟',
      faqAnswer2: 'بالتأكيد. نستخدم أنظمة دفع آمنة متوافقة مع معايير PCI-DSS. جميع المعاملات مشفرة ولا يتم تخزين بياناتك المصرفية على خوادمنا.',
      faqQuestion3: 'ما هو البوابة الرقمية البحرية؟',
      faqAnswer3: 'البوابة الرقمية البحرية هي منصة شاملة تمنحك الوصول إلى التتبع المتقدم وإدارة المستندات والتقارير المخصصة وتكامل API لأتمتة عملياتك.',
      faqQuestion4: 'هل تتضمن الخطط دعم 24/7؟',
      faqAnswer4: 'الدعم 24/7 مشمول في خطط Premium Tracking و Enterprise Logistics. تستفيد خطة Basic من دعم البريد الإلكتروني خلال ساعات العمل.',
      howItWorksTitle: 'كيف يعمل؟',
    },
    freightQuote: {
      faqTitle: 'الأسئلة الشائعة — عروض الأسعار والطلبات',
      faqQuestion1: 'كيف يعمل طلب عرض الأسعار؟',
      faqAnswer1: 'ما عليك سوى ملء النموذج بتفاصيل شحنتك وموانئ المنشأ/الوجهة. يقوم فريقنا بتحليل طلبك ويرسل لك عرض أسعار مفصل في غضون 24-48 ساعة.',
      faqQuestion2: 'كم من الوقت لتلقي عرض أسعار؟',
      faqAnswer2: 'ستتلقى عرض الأسعار المخصص الخاص بك في غضون 24 إلى 48 ساعة عمل. للطلبات العاجلة، اتصل بنا مباشرة عبر الهاتف أو WhatsApp.',
      faqQuestion3: 'هل يمكنني قبول عرض أسعار مباشرة عبر الإنترنت؟',
      faqAnswer3: 'نعم! بمجرد استلام عرض الأسعار الخاص بك، يمكنك قبوله مباشرة من مساحة العميل الخاصة بك. عملية التأكيد بسيطة وآمنة.',
      faqQuestion4: 'ما هي الموانئ المدعومة؟',
      faqAnswer4: 'نغطي أكثر من 150 ميناءً في جميع أنحاء العالم في أفريقيا وأوروبا وآسيا والأمريكتين وأوقيانوسيا. تحقق من صفحة "التغطية الميناء" لرؤية القائمة الكاملة.',
      faqQuestion5: 'هل الطلب مجاني؟',
      faqAnswer5: 'نعم، طلب عرض الأسعار مجاني تمامًا وبدون التزام. تدفع فقط إذا قبلت عرض الأسعار المقترح.',
      howItWorksTitle: 'كيف يعمل؟',
    },
    becomeAgentFaq: {
      faqTitle: 'الأسئلة الشائعة — الوكلاء الدوليون',
      faqQuestion1: 'ما هي المعايير لتصبح وكيلاً؟',
      faqAnswer1: 'يجب أن تكون مؤسسًا في ميناء تجاري، ولديك خبرة لا تقل عن سنتين في الخدمات البحرية أو اللوجستية، وأن يكون لديك فريق تشغيلي مخصص.',
      faqQuestion2: 'ما هي الفوائد لوكيل 3S؟',
      faqAnswer2: 'رؤية دولية على منصتنا، توصيات عملاء B2B مؤهلين، تعاون في مشاريع التأجير واللوجستيات، ودعم تشغيلي من مقرنا الرئيسي.',
      faqQuestion3: 'كم من الوقت يستغرق التحقق؟',
      faqAnswer3: 'تستغرق عملية التحقق عادةً من 5 إلى 10 أيام عمل. يقوم فريقنا بتحليل ملفك الشخصي والتحقق من مراجعك والاتصال بك لإنهاء تسجيلك.',
      faqQuestion4: 'ما هو Premium Agent Listing؟',
      faqAnswer4: 'يمنحك Premium Agent Listing أقصى قدر من الرؤية على منصتنا مع شارة "Premium"، ومكان مميز في صفحة التغطية الميناء، وملف تعريف مفصل مع شهاداتك وخدماتك.',
    },
    howItWorks: {
      step1Title: 'الخطوة 1 — إرسال الطلب',
      step1Desc: 'اختر الموانئ والخدمة والشحنة.',
      step2Title: 'الخطوة 2 — تحليل الخبراء',
      step2Desc: 'يدرس فريقنا الطلب ويحسب السعر.',
      step3Title: 'الخطوة 3 — التحقق والدفع',
      step3Desc: 'يمكن قبول عرض الأسعار مباشرة في التطبيق.',
      step4Title: 'الخطوة 4 — التتبع في الوقت الفعلي',
      step4Desc: 'الوصول إلى البوابة الرقمية لتتبع كل خطوة.',
    },
    confidenceBanner: {
      block1Title: 'دعم 24/7',
      block1Desc: 'مساعدة تشغيلية بحرية ولوجستية.',
      block2Title: 'خبراء معتمدون',
      block2Desc: '15 سنة من الخبرة الدولية.',
      block3Title: 'الأمن والامتثال',
      block3Desc: 'معايير ISPS – الجمارك – IMO.',
      block4Title: 'معالجة ذات أولوية',
      block4Desc: 'لعملاء Premium و Enterprise.',
    },
    trustBar: {
      item1: 'دفع آمن 100%',
      item2: 'التحقق في غضون 24-48 ساعة',
      item3: 'وصول فوري بعد التفعيل',
      item4: 'بيانات مشفرة ومحمية',
    },
    microCopies: {
      fastResponse: 'استجابة سريعة مضمونة',
      noCommitment: 'بدون التزام',
      secureOperations: 'عمليات آمنة',
      dataProtected: 'بيانات محمية',
    },
    feedbackMessages: {
      quoteSubmitted: 'تم إرسال طلبك. سيرد عليك خبير بسرعة.',
      agentApplicationSubmitted: 'تم إرسال طلبك. الرد في غضون 24-48 ساعة.',
      subscriptionActivated: 'شكراً! يتم تفعيل اشتراكك.',
      documentAdded: 'تمت إضافة المستند بنجاح.',
    },
    digitalPortal: {
      title: 'البوابة الرقمية البحرية',
      welcomeTitle: 'مرحبًا بك في بوابتك الرقمية',
      welcomeSubtitle: 'الوصول إلى جميع أدوات إدارة الشحن واللوجستيات الخاصة بك في مكان واحد.',
      redirecting: 'إعادة التوجيه إلى صفحة التسعير...',
      featuresTitle: 'ميزات البوابة',
      advancedTracking: 'التتبع المتقدم',
      advancedTrackingDesc: 'تتبع شحناتك في الوقت الفعلي مع تحديثات مفصلة وإشعارات تلقائية.',
      documents: 'المستندات والتقارير',
      documentsDesc: 'الوصول إلى جميع مستندات الشحن والفواتير والتقارير المخصصة.',
      analytics: 'التحليلات والتقارير',
      analyticsDesc: 'تصور إحصائيات الشحن الخاصة بك وإنشاء تقارير مفصلة لتحسين عملياتك.',
      apiAccess: 'الوصول إلى API',
      apiAccessDesc: 'دمج خدماتنا في أنظمتك مع API REST الكامل والموثق.',
      quickActions: 'الإجراءات السريعة',
      newQuote: 'عرض أسعار جديد',
      contactSupport: 'اتصل بالدعم',
      resources: 'الموارد',
      userGuide: 'دليل المستخدم',
      userGuideDesc: 'تعلم كيفية استخدام جميع ميزات البوابة',
      apiDocs: 'وثائق API',
      apiDocsDesc: 'وثائق كاملة لتكامل API',
      support: 'الدعم الفني',
      supportDesc: 'اتصل بفريقنا للحصول على أي مساعدة',
      infoBanner: 'قريبًا: إدارة متعددة المواقع، تكامل EDI، ولوحات معلومات قابلة للتخصيص.',
    },
    common: {
      back: 'رجوع',
      next: 'التالي',
      submit: 'إرسال',
      cancel: 'إلغاء',
      save: 'حفظ',
      loading: 'جار التحميل...',
      close: 'إغلاق',
      error: 'خطأ',
    },
  },
};
