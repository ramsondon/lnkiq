export const dictionaries = {
  en: {
    meta: {
      title: "lnkiq.net | Your Browsing Intelligence Dashboard",
      description: "Store your bookmarks, track your browsing activity, and gain insights into your online habits. Privacy-first with optional content analysis.",
    },
    nav: {
      features: "Features",
      contentAnalysis: "Content Analysis",
      privacy: "Privacy",
      terms: "Terms",
    },
    hero: {
      headline: "Your Bookmarks,",
      headlineAccent: "Intelligently Organized",
      description: "Store bookmarks via browser plugin or web app. Track where you spend your time online and",
      descriptionBold: "understand your browsing patterns",
      descriptionEnd: "with optional AI-powered content analysis.",
      cta: "Get Started Free",
      howItWorks: "See how it works →",
      badges: {
        anonymous: "Privacy First",
        noStorage: "You Control Your Data",
        honest: "Open & Transparent",
      },
    },
    howItWorks: {
      title: "How It Works",
      subtitle: "Three simple steps to organize your digital life",
      steps: [
        {
          icon: "plugin",
          step: "Step 1",
          title: "Install Extension",
          description: "Add our browser extension to save bookmarks with one click and optionally track your activity.",
        },
        {
          icon: "sync",
          step: "Step 2",
          title: "Sync & Organize",
          description: "Your bookmarks sync across devices. Organize with tags, folders, and smart collections.",
        },
        {
          icon: "insights",
          step: "Step 3",
          title: "Gain Insights",
          description: "View your browsing dashboard. See where you spend time and discover patterns.",
        },
      ],
    },
    features: {
      title: "Powerful Features",
      subtitle: "Everything you need to manage your bookmarks and understand your browsing habits",
      items: [
        {
          icon: "bookmark",
          title: "Smart Bookmarks",
          description: "Save any page instantly with our browser extension. Auto-extract titles, descriptions, and thumbnails.",
        },
        {
          icon: "sync",
          title: "Cross-Device Sync",
          description: "Access your bookmarks from any device. Your library stays in sync across browsers and platforms.",
        },
        {
          icon: "timeline",
          title: "Activity Timeline",
          description: "See where you've been. Track time spent on sites and visualize your browsing patterns.",
        },
        {
          icon: "tags",
          title: "Smart Tags",
          description: "Organize with tags and folders. Our AI can suggest tags based on content analysis.",
        },
      ],
    },
    dashboard: {
      title: "Your Personal Dashboard",
      subtitle: "See your browsing activity at a glance",
      card: {
        title: "Weekly Overview",
        basedOn: "Based on 127 pages visited",
        stats: {
          totalTime: "Total Time",
          totalTimeValue: "14h 32m",
          topCategory: "Top Category",
          topCategoryValue: "Development",
          bookmarksSaved: "Bookmarks Saved",
          bookmarksSavedValue: "23",
        },
        topSites: "Most Visited",
        topSitesList: ["github.com", "stackoverflow.com", "docs.nextjs.org"],
      },
    },
    contentAnalysisTeaser: {
      title: "Optional Content Analysis",
      description: "Want deeper insights? Enable AI-powered content analysis to understand what you read, discover patterns, and get personalized recommendations.",
      cta: "Learn More",
      note: "You decide if and when to enable this feature. Your privacy is always respected.",
    },
    cta: {
      title: "Ready to Get Organized?",
      description: "Join thousands of users who have taken control of their bookmarks and browsing habits.",
      note: "",
      button: "Create Free Account",
    },
    footer: {
      privacy: "Privacy",
      terms: "Terms",
      contact: "Contact",
      disclaimer: "",
      copyright: "© 2026 lnkiq.net. All rights reserved.",
    },
    auth: {
      signIn: {
        title: "Welcome back",
        subtitle: "Sign in to access your bookmarks and insights",
        terms: "By signing in, you agree to our",
        termsLink: "Terms of Service",
        and: "and",
        privacyLink: "Privacy Policy",
        backToHome: "Back to Home",
      },
      providers: {
        google: "Continue with Google",
        github: "Continue with GitHub",
        apple: "Continue with Apple",
        microsoft: "Continue with Microsoft",
      },
      errors: {
        title: "Authentication Error",
        configuration: "There is a problem with the server configuration.",
        accessDenied: "Access denied. You do not have permission to sign in.",
        verification: "The verification link has expired or has already been used.",
        default: "An error occurred during authentication. Please try again.",
        tryAgain: "Try Again",
        backToHome: "Back to Home",
      },
      userMenu: {
        dashboard: "Dashboard",
        settings: "Settings",
        signOut: "Sign Out",
      },
      dashboard: {
        welcome: "Welcome",
        user: "there",
        subtitle: "Here's an overview of your browsing activity",
        stats: {
          bookmarks: "Bookmarks",
          timeTracked: "Time Tracked",
          tags: "Tags",
        },
        getStarted: {
          title: "Get Started",
          description: "Complete these steps to make the most of lnkiq",
          step1: {
            title: "Install the browser extension",
            description: "Save bookmarks with one click and track your browsing activity.",
          },
          step2: {
            title: "Save your first bookmark",
            description: "Click the extension icon on any page to save it to your library.",
          },
          step3: {
            title: "Explore your insights",
            description: "Check back after a few days to see your browsing patterns.",
          },
        },
      },
      settings: {
        title: "Settings",
        backToDashboard: "Back to Dashboard",
        profile: {
          title: "Profile",
        },
        connectedAccounts: {
          title: "Connected Accounts",
          description: "Manage the accounts you use to sign in to lnkiq.",
          connected: "Connected",
          notConnected: "Not connected",
        },
        dataPrivacy: {
          title: "Data & Privacy",
          exportData: "Export your data",
          exportDescription: "Download all your bookmarks and activity data.",
          exportButton: "Export",
        },
        dangerZone: {
          title: "Danger Zone",
          deleteAccount: "Delete account",
          deleteDescription: "Permanently delete your account and all associated data.",
          deleteButton: "Delete Account",
        },
      },
    },
    privacy: {
      title: "Privacy Policy",
      lastUpdated: "Last updated: January 28, 2026",
      intro: "At lnkiq.net, we take your privacy seriously. This policy explains how we collect, use, and protect your data. You are always in control of your information.",
      backToHome: "Back to Home",
      dataCollection: {
        title: "What Data We Collect",
        description: "When you use our browser extension and service, we collect the following information:",
        items: [
          "Bookmarks you choose to save (URL, title, description)",
          "Browsing activity data (if you opt-in to activity tracking)",
          "Page content for analysis (only if you enable content analysis)",
          "Account information (email, preferences)",
        ],
      },
      dataUsage: {
        title: "How We Use Your Data",
        description: "We use your data to:",
        items: [
          "Store and sync your bookmarks across devices",
          "Generate your activity dashboard and insights",
          "Provide AI-powered content analysis (when enabled)",
          "Improve our service and user experience",
        ],
      },
      dataStorage: {
        title: "Data Storage & Security",
        description: "Your data is stored securely using industry-standard encryption. Bookmarks and activity data are stored on our servers to enable sync across devices. Content analysis is processed securely, and you can delete your data at any time.",
      },
      thirdParties: {
        title: "Third-Party Sharing",
        description: "We do not sell your personal data to third parties. We may use trusted service providers for hosting and analytics, all bound by strict data protection agreements.",
      },
      rights: {
        title: "Your Rights",
        description: "You have the right to:",
        items: [
          "Access all data we have about you",
          "Export your bookmarks and activity data",
          "Delete your account and all associated data",
          "Opt out of activity tracking or content analysis at any time",
        ],
      },
      contact: {
        title: "Contact Us",
        description: "If you have questions about this privacy policy or want to exercise your rights, contact us at:",
      },
    },
    terms: {
      title: "Terms of Service",
      lastUpdated: "Last updated: January 28, 2026",
      intro: "Welcome to lnkiq.net! These terms govern your use of our bookmark management and browsing analytics service.",
      backToHome: "Back to Home",
      acceptance: {
        title: "Acceptance of Terms",
        description: "By accessing or using lnkiq.net, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our service.",
      },
      service: {
        title: "Description of Service",
        description: "lnkiq.net provides:",
        items: [
          "A browser extension for saving and managing bookmarks",
          "Cloud sync for bookmarks across devices",
          "Browsing activity tracking and analytics dashboard",
          "Optional AI-powered content analysis for deeper insights",
        ],
      },
      userResponsibilities: {
        title: "User Responsibilities",
        description: "As a user, you agree to:",
        items: [
          "Provide accurate account information",
          "Keep your login credentials secure",
          "Use the service in compliance with applicable laws",
          "Not attempt to reverse-engineer or abuse the service",
          "Respect intellectual property rights of content you bookmark",
        ],
      },
      disclaimer: {
        title: "Service Disclaimer",
        description: "lnkiq.net is provided 'as is' without warranties of any kind. While we strive for reliability, we cannot guarantee uninterrupted service. Content analysis features are AI-powered and may not always be accurate.",
      },
      intellectualProperty: {
        title: "Intellectual Property",
        description: "All content, features, and functionality of lnkiq.net — including our software, design, and branding — are owned by us and protected by international copyright, trademark, and other intellectual property laws.",
      },
      liability: {
        title: "Limitation of Liability",
        description: "lnkiq.net shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability is limited to the amount you paid for the service.",
      },
      termination: {
        title: "Termination",
        description: "We reserve the right to terminate or suspend your access to the service at any time for violations of these terms. You can also terminate your account at any time through your settings.",
      },
      changes: {
        title: "Changes to Terms",
        description: "We may modify these terms at any time. We will notify you of significant changes via email or in-app notification. Continued use of the service after changes constitutes acceptance of the new terms.",
      },
      contact: {
        title: "Contact Us",
        description: "For questions about these terms, please contact us at:",
      },
    },
    contentAnalysis: {
      title: "Content Analysis",
      subtitle: "Understand what you read with AI-powered insights",
      intro: "Content Analysis is an optional feature that uses AI to analyze the pages you visit, helping you understand your reading patterns and discover insights.",
      backToHome: "Back to Home",
      howItWorks: {
        title: "How It Works",
        description: "When enabled, our AI processes the content of pages you visit to:",
        items: [
          "Categorize content by topic (technology, news, entertainment, etc.)",
          "Extract key themes and concepts from your reading",
          "Identify patterns in what you consume online",
          "Generate personalized reading insights and suggestions",
        ],
      },
      benefits: {
        title: "Benefits",
        items: [
          {
            title: "Understand Your Habits",
            description: "See what topics you spend the most time reading about.",
          },
          {
            title: "Discover Patterns",
            description: "Identify trends in your reading over time.",
          },
          {
            title: "Smart Recommendations",
            description: "Get suggestions based on your interests.",
          },
          {
            title: "Better Organization",
            description: "Auto-tag bookmarks based on content.",
          },
        ],
      },
      privacy: {
        title: "Your Privacy Matters",
        description: "Content Analysis is completely optional. You decide:",
        items: [
          "Enable or disable at any time from your settings",
          "Choose which sites to include or exclude",
          "Delete all analyzed data whenever you want",
          "Analysis happens securely — we never share your content",
        ],
      },
      toggle: {
        title: "You're in Control",
        description: "Toggle content analysis on or off anytime. When disabled, we only store the basic bookmark information you explicitly save.",
        enabled: "Content Analysis Enabled",
        disabled: "Content Analysis Disabled",
      },
      cta: {
        title: "Ready to Try It?",
        button: "Get Started",
        note: "Enable content analysis in your dashboard settings after signing up.",
      },
    },
  },
  de: {
    meta: {
      title: "lnkiq.net | Dein Browsing-Intelligence Dashboard",
      description: "Speichere deine Lesezeichen, verfolge deine Browsing-Aktivität und erhalte Einblicke in deine Online-Gewohnheiten. Datenschutz zuerst mit optionaler Inhaltsanalyse.",
    },
    nav: {
      features: "Funktionen",
      contentAnalysis: "Inhaltsanalyse",
      privacy: "Datenschutz",
      terms: "AGB",
    },
    hero: {
      headline: "Deine Lesezeichen,",
      headlineAccent: "Intelligent Organisiert",
      description: "Speichere Lesezeichen per Browser-Plugin oder Web-App. Verfolge, wo du deine Zeit online verbringst und",
      descriptionBold: "verstehe deine Browsing-Muster",
      descriptionEnd: "mit optionaler KI-gestützter Inhaltsanalyse.",
      cta: "Kostenlos starten",
      howItWorks: "So funktioniert's →",
      badges: {
        anonymous: "Datenschutz zuerst",
        noStorage: "Du kontrollierst deine Daten",
        honest: "Offen & Transparent",
      },
    },
    howItWorks: {
      title: "So funktioniert's",
      subtitle: "Drei einfache Schritte, um dein digitales Leben zu organisieren",
      steps: [
        {
          icon: "plugin",
          step: "Schritt 1",
          title: "Extension installieren",
          description: "Füge unsere Browser-Extension hinzu, um Lesezeichen mit einem Klick zu speichern und optional deine Aktivität zu verfolgen.",
        },
        {
          icon: "sync",
          step: "Schritt 2",
          title: "Synchronisieren & Organisieren",
          description: "Deine Lesezeichen synchronisieren sich über alle Geräte. Organisiere mit Tags, Ordnern und smarten Sammlungen.",
        },
        {
          icon: "insights",
          step: "Schritt 3",
          title: "Einblicke gewinnen",
          description: "Sieh dir dein Browsing-Dashboard an. Erkenne, wo du Zeit verbringst und entdecke Muster.",
        },
      ],
    },
    features: {
      title: "Leistungsstarke Funktionen",
      subtitle: "Alles was du brauchst, um deine Lesezeichen zu verwalten und deine Browsing-Gewohnheiten zu verstehen",
      items: [
        {
          icon: "bookmark",
          title: "Smarte Lesezeichen",
          description: "Speichere jede Seite sofort mit unserer Browser-Extension. Automatische Extraktion von Titeln, Beschreibungen und Vorschaubildern.",
        },
        {
          icon: "sync",
          title: "Geräteübergreifende Synchronisation",
          description: "Greife von jedem Gerät auf deine Lesezeichen zu. Deine Bibliothek bleibt über Browser und Plattformen synchron.",
        },
        {
          icon: "timeline",
          title: "Aktivitäts-Timeline",
          description: "Sieh, wo du warst. Verfolge die Zeit auf Websites und visualisiere deine Browsing-Muster.",
        },
        {
          icon: "tags",
          title: "Smarte Tags",
          description: "Organisiere mit Tags und Ordnern. Unsere KI kann Tags basierend auf Inhaltsanalyse vorschlagen.",
        },
      ],
    },
    dashboard: {
      title: "Dein persönliches Dashboard",
      subtitle: "Sieh deine Browsing-Aktivität auf einen Blick",
      card: {
        title: "Wochenübersicht",
        basedOn: "Basierend auf 127 besuchten Seiten",
        stats: {
          totalTime: "Gesamtzeit",
          totalTimeValue: "14h 32m",
          topCategory: "Top Kategorie",
          topCategoryValue: "Entwicklung",
          bookmarksSaved: "Gespeicherte Lesezeichen",
          bookmarksSavedValue: "23",
        },
        topSites: "Meistbesucht",
        topSitesList: ["github.com", "stackoverflow.com", "docs.nextjs.org"],
      },
    },
    contentAnalysisTeaser: {
      title: "Optionale Inhaltsanalyse",
      description: "Möchtest du tiefere Einblicke? Aktiviere die KI-gestützte Inhaltsanalyse, um zu verstehen, was du liest, Muster zu entdecken und personalisierte Empfehlungen zu erhalten.",
      cta: "Mehr erfahren",
      note: "Du entscheidest, ob und wann du diese Funktion aktivierst. Deine Privatsphäre wird immer respektiert.",
    },
    cta: {
      title: "Bereit für mehr Ordnung?",
      description: "Schließe dich Tausenden von Nutzern an, die die Kontrolle über ihre Lesezeichen und Browsing-Gewohnheiten übernommen haben.",
      note: "",
      button: "Kostenloses Konto erstellen",
    },
    footer: {
      privacy: "Datenschutz",
      terms: "AGB",
      contact: "Kontakt",
      disclaimer: "",
      copyright: "© 2026 lnkiq.net. Alle Rechte vorbehalten.",
    },
    auth: {
      signIn: {
        title: "Willkommen zurück",
        subtitle: "Melde dich an, um auf deine Lesezeichen und Einblicke zuzugreifen",
        terms: "Durch die Anmeldung stimmst du unseren",
        termsLink: "Nutzungsbedingungen",
        and: "und",
        privacyLink: "Datenschutzrichtlinie",
        backToHome: "Zurück zur Startseite",
      },
      providers: {
        google: "Mit Google fortfahren",
        github: "Mit GitHub fortfahren",
        apple: "Mit Apple fortfahren",
        microsoft: "Mit Microsoft fortfahren",
      },
      errors: {
        title: "Authentifizierungsfehler",
        configuration: "Es gibt ein Problem mit der Serverkonfiguration.",
        accessDenied: "Zugriff verweigert. Du hast keine Berechtigung, dich anzumelden.",
        verification: "Der Bestätigungslink ist abgelaufen oder wurde bereits verwendet.",
        default: "Bei der Authentifizierung ist ein Fehler aufgetreten. Bitte versuche es erneut.",
        tryAgain: "Erneut versuchen",
        backToHome: "Zurück zur Startseite",
      },
      userMenu: {
        dashboard: "Dashboard",
        settings: "Einstellungen",
        signOut: "Abmelden",
      },
      dashboard: {
        welcome: "Willkommen",
        user: "zurück",
        subtitle: "Hier ist eine Übersicht deiner Browsing-Aktivität",
        stats: {
          bookmarks: "Lesezeichen",
          timeTracked: "Erfasste Zeit",
          tags: "Tags",
        },
        getStarted: {
          title: "Erste Schritte",
          description: "Führe diese Schritte aus, um das Beste aus lnkiq herauszuholen",
          step1: {
            title: "Browser-Extension installieren",
            description: "Speichere Lesezeichen mit einem Klick und verfolge deine Browsing-Aktivität.",
          },
          step2: {
            title: "Erstes Lesezeichen speichern",
            description: "Klicke auf das Extension-Symbol auf einer beliebigen Seite, um sie zu speichern.",
          },
          step3: {
            title: "Deine Einblicke erkunden",
            description: "Schau nach ein paar Tagen wieder vorbei, um deine Browsing-Muster zu sehen.",
          },
        },
      },
      settings: {
        title: "Einstellungen",
        backToDashboard: "Zurück zum Dashboard",
        profile: {
          title: "Profil",
        },
        connectedAccounts: {
          title: "Verbundene Konten",
          description: "Verwalte die Konten, mit denen du dich bei lnkiq anmeldest.",
          connected: "Verbunden",
          notConnected: "Nicht verbunden",
        },
        dataPrivacy: {
          title: "Daten & Datenschutz",
          exportData: "Daten exportieren",
          exportDescription: "Lade alle deine Lesezeichen und Aktivitätsdaten herunter.",
          exportButton: "Exportieren",
        },
        dangerZone: {
          title: "Gefahrenzone",
          deleteAccount: "Konto löschen",
          deleteDescription: "Lösche dein Konto und alle zugehörigen Daten dauerhaft.",
          deleteButton: "Konto löschen",
        },
      },
    },
    privacy: {
      title: "Datenschutzerklärung",
      lastUpdated: "Zuletzt aktualisiert: 28. Januar 2026",
      intro: "Bei lnkiq.net nehmen wir deinen Datenschutz ernst. Diese Richtlinie erklärt, wie wir deine Daten erheben, verwenden und schützen. Du hast immer die Kontrolle über deine Informationen.",
      backToHome: "Zurück zur Startseite",
      dataCollection: {
        title: "Welche Daten wir erheben",
        description: "Wenn du unsere Browser-Erweiterung und unseren Dienst nutzt, erheben wir folgende Informationen:",
        items: [
          "Lesezeichen, die du speicherst (URL, Titel, Beschreibung)",
          "Browsing-Aktivitätsdaten (wenn du Aktivitätsverfolgung aktivierst)",
          "Seiteninhalte für Analyse (nur wenn du Inhaltsanalyse aktivierst)",
          "Kontoinformationen (E-Mail, Einstellungen)",
        ],
      },
      dataUsage: {
        title: "Wie wir deine Daten verwenden",
        description: "Wir verwenden deine Daten um:",
        items: [
          "Deine Lesezeichen zu speichern und über Geräte zu synchronisieren",
          "Dein Aktivitäts-Dashboard und Einblicke zu generieren",
          "KI-gestützte Inhaltsanalyse bereitzustellen (wenn aktiviert)",
          "Unseren Service und die Benutzererfahrung zu verbessern",
        ],
      },
      dataStorage: {
        title: "Datenspeicherung & Sicherheit",
        description: "Deine Daten werden sicher mit branchenüblicher Verschlüsselung gespeichert. Lesezeichen und Aktivitätsdaten werden auf unseren Servern gespeichert, um die Synchronisation über Geräte zu ermöglichen. Inhaltsanalyse wird sicher verarbeitet, und du kannst deine Daten jederzeit löschen.",
      },
      thirdParties: {
        title: "Weitergabe an Dritte",
        description: "Wir verkaufen deine persönlichen Daten nicht an Dritte. Wir können vertrauenswürdige Dienstleister für Hosting und Analysen nutzen, die alle an strenge Datenschutzvereinbarungen gebunden sind.",
      },
      rights: {
        title: "Deine Rechte",
        description: "Du hast das Recht:",
        items: [
          "Auf alle Daten zuzugreifen, die wir über dich haben",
          "Deine Lesezeichen und Aktivitätsdaten zu exportieren",
          "Dein Konto und alle zugehörigen Daten zu löschen",
          "Aktivitätsverfolgung oder Inhaltsanalyse jederzeit abzulehnen",
        ],
      },
      contact: {
        title: "Kontakt",
        description: "Wenn du Fragen zu dieser Datenschutzerklärung hast oder deine Rechte ausüben möchtest, kontaktiere uns unter:",
      },
    },
    terms: {
      title: "Allgemeine Geschäftsbedingungen",
      lastUpdated: "Zuletzt aktualisiert: 28. Januar 2026",
      intro: "Willkommen bei lnkiq.net! Diese Bedingungen regeln die Nutzung unseres Lesezeichen-Management- und Browsing-Analyse-Dienstes.",
      backToHome: "Zurück zur Startseite",
      acceptance: {
        title: "Annahme der Bedingungen",
        description: "Durch den Zugriff auf oder die Nutzung von lnkiq.net erklärst du dich mit diesen Nutzungsbedingungen einverstanden. Wenn du mit einem Teil dieser Bedingungen nicht einverstanden bist, darfst du unseren Dienst nicht nutzen.",
      },
      service: {
        title: "Beschreibung des Dienstes",
        description: "lnkiq.net bietet:",
        items: [
          "Eine Browser-Erweiterung zum Speichern und Verwalten von Lesezeichen",
          "Cloud-Synchronisation für Lesezeichen über Geräte",
          "Browsing-Aktivitätsverfolgung und Analyse-Dashboard",
          "Optionale KI-gestützte Inhaltsanalyse für tiefere Einblicke",
        ],
      },
      userResponsibilities: {
        title: "Nutzerpflichten",
        description: "Als Nutzer stimmst du zu:",
        items: [
          "Genaue Kontoinformationen anzugeben",
          "Deine Anmeldedaten sicher zu halten",
          "Den Dienst in Übereinstimmung mit geltenden Gesetzen zu nutzen",
          "Nicht zu versuchen, den Dienst zu reverse-engineeren oder zu missbrauchen",
          "Geistige Eigentumsrechte von Inhalten, die du als Lesezeichen speicherst, zu respektieren",
        ],
      },
      disclaimer: {
        title: "Service-Haftungsausschluss",
        description: "lnkiq.net wird ohne jegliche Garantie bereitgestellt. Obwohl wir nach Zuverlässigkeit streben, können wir keinen unterbrechungsfreien Service garantieren. Inhaltsanalyse-Funktionen sind KI-gestützt und möglicherweise nicht immer genau.",
      },
      intellectualProperty: {
        title: "Geistiges Eigentum",
        description: "Alle Inhalte, Funktionen und Funktionalitäten von lnkiq.net — einschließlich unserer Software, Design und Marken — sind unser Eigentum und durch internationale Urheberrechts-, Marken- und andere Gesetze zum Schutz geistigen Eigentums geschützt.",
      },
      liability: {
        title: "Haftungsbeschränkung",
        description: "lnkiq.net haftet nicht für indirekte, zufällige, besondere oder Folgeschäden, die sich aus deiner Nutzung des Dienstes ergeben. Unsere Gesamthaftung ist auf den Betrag beschränkt, den du für den Dienst bezahlt hast.",
      },
      termination: {
        title: "Kündigung",
        description: "Wir behalten uns das Recht vor, deinen Zugang zum Dienst jederzeit bei Verstößen gegen diese Bedingungen zu beenden oder auszusetzen. Du kannst dein Konto auch jederzeit über deine Einstellungen kündigen.",
      },
      changes: {
        title: "Änderungen der Bedingungen",
        description: "Wir können diese Bedingungen jederzeit ändern. Wir werden dich über wesentliche Änderungen per E-Mail oder In-App-Benachrichtigung informieren. Die fortgesetzte Nutzung des Dienstes nach Änderungen gilt als Annahme der neuen Bedingungen.",
      },
      contact: {
        title: "Kontakt",
        description: "Bei Fragen zu diesen Bedingungen kontaktiere uns bitte unter:",
      },
    },
    contentAnalysis: {
      title: "Inhaltsanalyse",
      subtitle: "Verstehe, was du liest, mit KI-gestützten Einblicken",
      intro: "Inhaltsanalyse ist eine optionale Funktion, die KI nutzt, um die Seiten zu analysieren, die du besuchst, und dir hilft, deine Lesemuster zu verstehen und Einblicke zu entdecken.",
      backToHome: "Zurück zur Startseite",
      howItWorks: {
        title: "So funktioniert's",
        description: "Wenn aktiviert, verarbeitet unsere KI den Inhalt der Seiten, die du besuchst, um:",
        items: [
          "Inhalte nach Thema zu kategorisieren (Technologie, Nachrichten, Unterhaltung, etc.)",
          "Wichtige Themen und Konzepte aus deiner Lektüre zu extrahieren",
          "Muster in dem zu identifizieren, was du online konsumierst",
          "Personalisierte Lese-Einblicke und Vorschläge zu generieren",
        ],
      },
      benefits: {
        title: "Vorteile",
        items: [
          {
            title: "Verstehe deine Gewohnheiten",
            description: "Sieh, über welche Themen du am meisten liest.",
          },
          {
            title: "Entdecke Muster",
            description: "Identifiziere Trends in deiner Lektüre über die Zeit.",
          },
          {
            title: "Smarte Empfehlungen",
            description: "Erhalte Vorschläge basierend auf deinen Interessen.",
          },
          {
            title: "Bessere Organisation",
            description: "Automatisches Taggen von Lesezeichen basierend auf Inhalt.",
          },
        ],
      },
      privacy: {
        title: "Deine Privatsphäre ist wichtig",
        description: "Inhaltsanalyse ist vollständig optional. Du entscheidest:",
        items: [
          "Jederzeit in deinen Einstellungen aktivieren oder deaktivieren",
          "Wähle, welche Seiten eingeschlossen oder ausgeschlossen werden",
          "Lösche alle analysierten Daten, wann immer du willst",
          "Analyse erfolgt sicher — wir teilen deine Inhalte niemals",
        ],
      },
      toggle: {
        title: "Du hast die Kontrolle",
        description: "Schalte Inhaltsanalyse jederzeit ein oder aus. Wenn deaktiviert, speichern wir nur die grundlegenden Lesezeichen-Informationen, die du explizit speicherst.",
        enabled: "Inhaltsanalyse Aktiviert",
        disabled: "Inhaltsanalyse Deaktiviert",
      },
      cta: {
        title: "Bereit es auszuprobieren?",
        button: "Jetzt starten",
        note: "Aktiviere Inhaltsanalyse in deinen Dashboard-Einstellungen nach der Anmeldung.",
      },
    },
  },
} as const;

export type Locale = keyof typeof dictionaries;

export interface Dictionary {
  meta: {
    readonly title: string;
    readonly description: string;
  };
  nav: {
    readonly features: string;
    readonly contentAnalysis: string;
    readonly privacy: string;
    readonly terms: string;
  };
  hero: {
    readonly headline: string;
    readonly headlineAccent: string;
    readonly description: string;
    readonly descriptionBold: string;
    readonly descriptionEnd: string;
    readonly cta: string;
    readonly howItWorks: string;
    readonly badges: {
      readonly anonymous: string;
      readonly noStorage: string;
      readonly honest: string;
    };
  };
  howItWorks: {
    readonly title: string;
    readonly subtitle: string;
    readonly steps: ReadonlyArray<{
      readonly icon: string;
      readonly step: string;
      readonly title: string;
      readonly description: string;
    }>;
  };
  features: {
    readonly title: string;
    readonly subtitle: string;
    readonly items: ReadonlyArray<{
      readonly icon: string;
      readonly title: string;
      readonly description: string;
    }>;
  };
  dashboard: {
    readonly title: string;
    readonly subtitle: string;
    readonly card: {
      readonly title: string;
      readonly basedOn: string;
      readonly stats: {
        readonly totalTime: string;
        readonly totalTimeValue: string;
        readonly topCategory: string;
        readonly topCategoryValue: string;
        readonly bookmarksSaved: string;
        readonly bookmarksSavedValue: string;
      };
      readonly topSites: string;
      readonly topSitesList: ReadonlyArray<string>;
    };
  };
  contentAnalysisTeaser: {
    readonly title: string;
    readonly description: string;
    readonly cta: string;
    readonly note: string;
  };
  cta: {
    readonly title: string;
    readonly description: string;
    readonly note: string;
    readonly button: string;
  };
  footer: {
    readonly privacy: string;
    readonly terms: string;
    readonly contact: string;
    readonly disclaimer: string;
    readonly copyright: string;
  };
  auth: {
    readonly signIn: {
      readonly title: string;
      readonly subtitle: string;
      readonly terms: string;
      readonly termsLink: string;
      readonly and: string;
      readonly privacyLink: string;
      readonly backToHome: string;
    };
    readonly providers: {
      readonly google: string;
      readonly github: string;
      readonly apple: string;
      readonly microsoft: string;
    };
    readonly errors: {
      readonly title: string;
      readonly configuration: string;
      readonly accessDenied: string;
      readonly verification: string;
      readonly default: string;
      readonly tryAgain: string;
      readonly backToHome: string;
    };
    readonly userMenu: {
      readonly dashboard: string;
      readonly settings: string;
      readonly signOut: string;
    };
    readonly dashboard: {
      readonly welcome: string;
      readonly user: string;
      readonly subtitle: string;
      readonly stats: {
        readonly bookmarks: string;
        readonly timeTracked: string;
        readonly tags: string;
      };
      readonly getStarted: {
        readonly title: string;
        readonly description: string;
        readonly step1: {
          readonly title: string;
          readonly description: string;
        };
        readonly step2: {
          readonly title: string;
          readonly description: string;
        };
        readonly step3: {
          readonly title: string;
          readonly description: string;
        };
      };
    };
    readonly settings: {
      readonly title: string;
      readonly backToDashboard: string;
      readonly profile: {
        readonly title: string;
      };
      readonly connectedAccounts: {
        readonly title: string;
        readonly description: string;
        readonly connected: string;
        readonly notConnected: string;
      };
      readonly dataPrivacy: {
        readonly title: string;
        readonly exportData: string;
        readonly exportDescription: string;
        readonly exportButton: string;
      };
      readonly dangerZone: {
        readonly title: string;
        readonly deleteAccount: string;
        readonly deleteDescription: string;
        readonly deleteButton: string;
      };
    };
  };
  privacy: {
    readonly title: string;
    readonly lastUpdated: string;
    readonly intro: string;
    readonly backToHome: string;
    readonly dataCollection: {
      readonly title: string;
      readonly description: string;
      readonly items: ReadonlyArray<string>;
    };
    readonly dataUsage: {
      readonly title: string;
      readonly description: string;
      readonly items: ReadonlyArray<string>;
    };
    readonly dataStorage: {
      readonly title: string;
      readonly description: string;
    };
    readonly thirdParties: {
      readonly title: string;
      readonly description: string;
    };
    readonly rights: {
      readonly title: string;
      readonly description: string;
      readonly items: ReadonlyArray<string>;
    };
    readonly contact: {
      readonly title: string;
      readonly description: string;
    };
  };
  terms: {
    readonly title: string;
    readonly lastUpdated: string;
    readonly intro: string;
    readonly backToHome: string;
    readonly acceptance: {
      readonly title: string;
      readonly description: string;
    };
    readonly service: {
      readonly title: string;
      readonly description: string;
      readonly items: ReadonlyArray<string>;
    };
    readonly userResponsibilities: {
      readonly title: string;
      readonly description: string;
      readonly items: ReadonlyArray<string>;
    };
    readonly disclaimer: {
      readonly title: string;
      readonly description: string;
    };
    readonly intellectualProperty: {
      readonly title: string;
      readonly description: string;
    };
    readonly liability: {
      readonly title: string;
      readonly description: string;
    };
    readonly termination: {
      readonly title: string;
      readonly description: string;
    };
    readonly changes: {
      readonly title: string;
      readonly description: string;
    };
    readonly contact: {
      readonly title: string;
      readonly description: string;
    };
  };
  contentAnalysis: {
    readonly title: string;
    readonly subtitle: string;
    readonly intro: string;
    readonly backToHome: string;
    readonly howItWorks: {
      readonly title: string;
      readonly description: string;
      readonly items: ReadonlyArray<string>;
    };
    readonly benefits: {
      readonly title: string;
      readonly items: ReadonlyArray<{
        readonly title: string;
        readonly description: string;
      }>;
    };
    readonly privacy: {
      readonly title: string;
      readonly description: string;
      readonly items: ReadonlyArray<string>;
    };
    readonly toggle: {
      readonly title: string;
      readonly description: string;
      readonly enabled: string;
      readonly disabled: string;
    };
    readonly cta: {
      readonly title: string;
      readonly button: string;
      readonly note: string;
    };
  };
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}
