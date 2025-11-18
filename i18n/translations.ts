
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
  };
  common: {
    back: string;
    next: string;
    submit: string;
    cancel: string;
    save: string;
    loading: string;
    close: string;
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
      premiumButton: 'Souscrire',
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
      faqQuestion1: 'Comment fonctionne la facturation ?',
      faqAnswer1: 'La facturation est mensuelle ou annuelle selon le plan choisi. Vous recevrez une facture détaillée par email et pourrez gérer vos paiements depuis votre espace client.',
      faqQuestion2: 'Puis-je changer de plan ?',
      faqAnswer2: 'Oui, vous pouvez changer de plan à tout moment. Le changement prendra effet immédiatement et sera proratisé selon votre période de facturation.',
      faqQuestion3: 'Proposez-vous des solutions sur mesure ?',
      faqAnswer3: 'Absolument ! Pour les entreprises avec des besoins spécifiques, nous proposons des solutions personnalisées. Contactez notre équipe commerciale pour discuter de vos besoins.',
      faqQuestion4: 'Y a-t-il un engagement de durée ?',
      faqAnswer4: 'Non, tous nos plans sont sans engagement. Vous pouvez annuler à tout moment depuis votre espace client.',
    },
    common: {
      back: 'Retour',
      next: 'Suivant',
      submit: 'Soumettre',
      cancel: 'Annuler',
      save: 'Enregistrer',
      loading: 'Chargement...',
      close: 'Fermer',
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
      premiumButton: 'Subscribe',
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
      faqQuestion1: 'How does billing work?',
      faqAnswer1: 'Billing is monthly or annual depending on the plan chosen. You will receive a detailed invoice by email and can manage your payments from your client space.',
      faqQuestion2: 'Can I change plans?',
      faqAnswer2: 'Yes, you can change plans at any time. The change will take effect immediately and will be prorated according to your billing period.',
      faqQuestion3: 'Do you offer custom solutions?',
      faqAnswer3: 'Absolutely! For businesses with specific needs, we offer customized solutions. Contact our sales team to discuss your requirements.',
      faqQuestion4: 'Is there a commitment period?',
      faqAnswer4: 'No, all our plans are commitment-free. You can cancel at any time from your client space.',
    },
    common: {
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      loading: 'Loading...',
      close: 'Close',
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
      premiumButton: 'Suscribirse',
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
      faqQuestion1: '¿Cómo funciona la facturación?',
      faqAnswer1: 'La facturación es mensual o anual según el plan elegido. Recibirá una factura detallada por correo electrónico y podrá gestionar sus pagos desde su espacio de cliente.',
      faqQuestion2: '¿Puedo cambiar de plan?',
      faqAnswer2: 'Sí, puede cambiar de plan en cualquier momento. El cambio tendrá efecto inmediato y se prorrateará según su período de facturación.',
      faqQuestion3: '¿Ofrecen soluciones personalizadas?',
      faqAnswer3: '¡Absolutamente! Para empresas con necesidades específicas, ofrecemos soluciones personalizadas. Póngase en contacto con nuestro equipo de ventas para discutir sus requisitos.',
      faqQuestion4: '¿Hay un período de compromiso?',
      faqAnswer4: 'No, todos nuestros planes son sin compromiso. Puede cancelar en cualquier momento desde su espacio de cliente.',
    },
    common: {
      back: 'Atrás',
      next: 'Siguiente',
      submit: 'Enviar',
      cancel: 'Cancelar',
      save: 'Guardar',
      loading: 'Cargando...',
      close: 'Cerrar',
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
      premiumButton: 'اشترك',
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
      faqQuestion1: 'كيف تعمل الفوترة؟',
      faqAnswer1: 'الفوترة شهرية أو سنوية حسب الخطة المختارة. ستتلقى فاتورة مفصلة عبر البريد الإلكتروني ويمكنك إدارة مدفوعاتك من مساحة العميل الخاصة بك.',
      faqQuestion2: 'هل يمكنني تغيير الخطط؟',
      faqAnswer2: 'نعم، يمكنك تغيير الخطط في أي وقت. سيدخل التغيير حيز التنفيذ على الفور وسيتم تقسيمه بالتناسب وفقًا لفترة الفوترة الخاصة بك.',
      faqQuestion3: 'هل تقدمون حلولاً مخصصة؟',
      faqAnswer3: 'بالتأكيد! للشركات ذات الاحتياجات الخاصة، نقدم حلولاً مخصصة. اتصل بفريق المبيعات لدينا لمناقشة متطلباتك.',
      faqQuestion4: 'هل هناك فترة التزام؟',
      faqAnswer4: 'لا، جميع خططنا بدون التزام. يمكنك الإلغاء في أي وقت من مساحة العميل الخاصة بك.',
    },
    common: {
      back: 'رجوع',
      next: 'التالي',
      submit: 'إرسال',
      cancel: 'إلغاء',
      save: 'حفظ',
      loading: 'جار التحميل...',
      close: 'إغلاق',
    },
  },
};
