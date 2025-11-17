
export type Language = 'fr' | 'en' | 'es' | 'ar';

export interface Translations {
  home: {
    title: string;
    subtitle: string;
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
  globalServices: {
    title: string;
    subtitle: string;
    maritime: string;
    logistics: string;
    customs: string;
    warehousing: string;
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
  };
}

export const translations: Record<Language, Translations> = {
  fr: {
    home: {
      title: '3S Global',
      subtitle: 'Univers Shipping Services',
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
    globalServices: {
      title: 'Services Globaux',
      subtitle: 'Solutions maritimes et logistiques complètes',
      maritime: 'Services Maritimes',
      logistics: 'Logistique',
      customs: 'Douanes',
      warehousing: 'Entreposage',
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
    },
  },
  en: {
    home: {
      title: '3S Global',
      subtitle: 'Univers Shipping Services',
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
    globalServices: {
      title: 'Global Services',
      subtitle: 'Complete maritime and logistics solutions',
      maritime: 'Maritime Services',
      logistics: 'Logistics',
      customs: 'Customs',
      warehousing: 'Warehousing',
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
    },
  },
  es: {
    home: {
      title: '3S Global',
      subtitle: 'Univers Shipping Services',
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
    globalServices: {
      title: 'Servicios Globales',
      subtitle: 'Soluciones marítimas y logísticas completas',
      maritime: 'Servicios Marítimos',
      logistics: 'Logística',
      customs: 'Aduanas',
      warehousing: 'Almacenamiento',
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
    },
  },
  ar: {
    home: {
      title: '3S Global',
      subtitle: 'خدمات الشحن العالمية',
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
    globalServices: {
      title: 'الخدمات العالمية',
      subtitle: 'حلول بحرية ولوجستية شاملة',
      maritime: 'الخدمات البحرية',
      logistics: 'اللوجستيات',
      customs: 'الجمارك',
      warehousing: 'التخزين',
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
    },
  },
};
