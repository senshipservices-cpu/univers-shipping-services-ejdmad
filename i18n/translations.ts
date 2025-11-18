
export type Language = 'fr' | 'en' | 'es' | 'ar';

export interface Translations {
  home: {
    title: string;
    subtitle: string;
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    discoverServices: string;
    requestQuote: string;
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
  };
  portCoverage: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
  };
  becomeAgent: {
    title: string;
    subtitle: string;
    benefits: string;
    apply: string;
  };
  clientSpace: {
    title: string;
    login: string;
    register: string;
    tracking: string;
    documents: string;
  };
  pricing: {
    title: string;
    subtitle: string;
    getQuote: string;
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
    home: {
      title: '3S Global',
      subtitle: 'Univers Shipping Services',
      heroTitle: 'Global Maritime & Logistics Solutions',
      heroSubtitle: 'Connecting Ships, Ports & Businesses Worldwide',
      heroDescription: 'Univers Shipping Services accompagne armateurs, chargeurs et entreprises dans leurs opérations maritimes, portuaires et logistiques à l\'échelle mondiale : affrètement, consignation, douane, logistique intégrée et consulting.',
      discoverServices: 'Découvrir nos services',
      requestQuote: 'Demander un devis',
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
      maritime: 'Services Maritimes',
      logistics: 'Logistique',
      customs: 'Douanes',
      warehousing: 'Entreposage',
      allCategories: 'Tous',
      maritimeShipping: 'Maritime & Shipping',
      logisticsPortHandling: 'Logistics & Port Handling',
      tradeConsulting: 'Trade & Consulting',
      digitalServices: 'Digital Services',
      premium: 'Premium',
      details: 'Détails',
      requestOffer: 'Demander une offre pour ce service',
      category: 'Catégorie',
      noServices: 'Aucun service disponible pour cette catégorie.',
      loading: 'Chargement des services...',
    },
    portCoverage: {
      title: 'Couverture Portuaire',
      subtitle: 'Réseau mondial de ports',
      searchPlaceholder: 'Rechercher un port...',
    },
    becomeAgent: {
      title: 'Devenir Agent Global',
      subtitle: 'Rejoignez notre réseau',
      benefits: 'Avantages',
      apply: 'Postuler',
    },
    clientSpace: {
      title: 'Espace Client',
      login: 'Connexion',
      register: 'Inscription',
      tracking: 'Suivi',
      documents: 'Documents',
    },
    pricing: {
      title: 'Tarification',
      subtitle: 'Obtenez un devis',
      getQuote: 'Demander un devis',
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
    home: {
      title: '3S Global',
      subtitle: 'Univers Shipping Services',
      heroTitle: 'Global Maritime & Logistics Solutions',
      heroSubtitle: 'Connecting Ships, Ports & Businesses Worldwide',
      heroDescription: 'Univers Shipping Services supports shipowners, shippers and businesses in their maritime, port and logistics operations worldwide: chartering, ship agency, customs, integrated logistics and consulting.',
      discoverServices: 'Discover our services',
      requestQuote: 'Request a quote',
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
      maritime: 'Maritime Services',
      logistics: 'Logistics',
      customs: 'Customs',
      warehousing: 'Warehousing',
      allCategories: 'All',
      maritimeShipping: 'Maritime & Shipping',
      logisticsPortHandling: 'Logistics & Port Handling',
      tradeConsulting: 'Trade & Consulting',
      digitalServices: 'Digital Services',
      premium: 'Premium',
      details: 'Details',
      requestOffer: 'Request an offer for this service',
      category: 'Category',
      noServices: 'No services available for this category.',
      loading: 'Loading services...',
    },
    portCoverage: {
      title: 'Port Coverage',
      subtitle: 'Worldwide port network',
      searchPlaceholder: 'Search for a port...',
    },
    becomeAgent: {
      title: 'Become a Global Agent',
      subtitle: 'Join our network',
      benefits: 'Benefits',
      apply: 'Apply',
    },
    clientSpace: {
      title: 'Client Space',
      login: 'Login',
      register: 'Register',
      tracking: 'Tracking',
      documents: 'Documents',
    },
    pricing: {
      title: 'Pricing',
      subtitle: 'Get a quote',
      getQuote: 'Request a quote',
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
    home: {
      title: '3S Global',
      subtitle: 'Univers Shipping Services',
      heroTitle: 'Global Maritime & Logistics Solutions',
      heroSubtitle: 'Connecting Ships, Ports & Businesses Worldwide',
      heroDescription: 'Univers Shipping Services apoya a armadores, cargadores y empresas en sus operaciones marítimas, portuarias y logísticas en todo el mundo: fletamento, consignación, aduanas, logística integrada y consultoría.',
      discoverServices: 'Descubrir nuestros servicios',
      requestQuote: 'Solicitar cotización',
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
      maritime: 'Servicios Marítimos',
      logistics: 'Logística',
      customs: 'Aduanas',
      warehousing: 'Almacenamiento',
      allCategories: 'Todos',
      maritimeShipping: 'Maritime & Shipping',
      logisticsPortHandling: 'Logistics & Port Handling',
      tradeConsulting: 'Trade & Consulting',
      digitalServices: 'Digital Services',
      premium: 'Premium',
      details: 'Detalles',
      requestOffer: 'Solicitar una oferta para este servicio',
      category: 'Categoría',
      noServices: 'No hay servicios disponibles para esta categoría.',
      loading: 'Cargando servicios...',
    },
    portCoverage: {
      title: 'Cobertura Portuaria',
      subtitle: 'Red mundial de puertos',
      searchPlaceholder: 'Buscar un puerto...',
    },
    becomeAgent: {
      title: 'Conviértete en Agente Global',
      subtitle: 'Únete a nuestra red',
      benefits: 'Beneficios',
      apply: 'Aplicar',
    },
    clientSpace: {
      title: 'Espacio Cliente',
      login: 'Iniciar sesión',
      register: 'Registrarse',
      tracking: 'Seguimiento',
      documents: 'Documentos',
    },
    pricing: {
      title: 'Precios',
      subtitle: 'Obtén una cotización',
      getQuote: 'Solicitar cotización',
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
    home: {
      title: '3S Global',
      subtitle: 'خدمات الشحن العالمية',
      heroTitle: 'Global Maritime & Logistics Solutions',
      heroSubtitle: 'Connecting Ships, Ports & Businesses Worldwide',
      heroDescription: 'تدعم خدمات الشحن العالمية أصحاب السفن والشاحنين والشركات في عملياتهم البحرية والميناء واللوجستية في جميع أنحاء العالم: التأجير والوكالة البحرية والجمارك واللوجستيات المتكاملة والاستشارات.',
      discoverServices: 'اكتشف خدماتنا',
      requestQuote: 'طلب عرض أسعار',
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
      maritime: 'الخدمات البحرية',
      logistics: 'اللوجستيات',
      customs: 'الجمارك',
      warehousing: 'التخزين',
      allCategories: 'الكل',
      maritimeShipping: 'Maritime & Shipping',
      logisticsPortHandling: 'Logistics & Port Handling',
      tradeConsulting: 'Trade & Consulting',
      digitalServices: 'Digital Services',
      premium: 'بريميوم',
      details: 'التفاصيل',
      requestOffer: 'طلب عرض لهذه الخدمة',
      category: 'الفئة',
      noServices: 'لا توجد خدمات متاحة لهذه الفئة.',
      loading: 'جار تحميل الخدمات...',
    },
    portCoverage: {
      title: 'التغطية الميناء',
      subtitle: 'شبكة الموانئ العالمية',
      searchPlaceholder: 'البحث عن ميناء...',
    },
    becomeAgent: {
      title: 'كن وكيلاً عالمياً',
      subtitle: 'انضم إلى شبكتنا',
      benefits: 'الفوائد',
      apply: 'تقديم الطلب',
    },
    clientSpace: {
      title: 'مساحة العميل',
      login: 'تسجيل الدخول',
      register: 'التسجيل',
      tracking: 'التتبع',
      documents: 'المستندات',
    },
    pricing: {
      title: 'التسعير',
      subtitle: 'احصل على عرض أسعار',
      getQuote: 'طلب عرض أسعار',
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
