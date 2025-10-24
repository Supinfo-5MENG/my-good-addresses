describe('My Good Addresses E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: {
        location: 'always',
        camera: 'YES',
        photos: 'YES',
      },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Authentication Flow', () => {
    it('should show login screen on first launch', async () => {
      await expect(element(by.text('Connexion'))).toBeVisible();
      await expect(element(by.placeholder('Email'))).toBeVisible();
      await expect(element(by.placeholder('Mot de passe'))).toBeVisible();
    });

    it('should navigate to register screen', async () => {
      await element(by.text('Créer un compte')).tap();
      await expect(element(by.text('Créer un compte'))).toBeVisible();
      await expect(element(by.placeholder("Nom d'utilisateur"))).toBeVisible();
    });

    it('should register a new user', async () => {
      await element(by.text('Créer un compte')).tap();
      
      const timestamp = Date.now();
      const email = `test${timestamp}@example.com`;
      
      await element(by.placeholder("Nom d'utilisateur")).typeText('Test User');
      await element(by.placeholder('Email')).typeText(email);
      await element(by.placeholder('Mot de passe')).typeText('Test123456');
      await element(by.placeholder('Confirmer le mot de passe')).typeText('Test123456');
      
      await element(by.text("S'inscrire")).tap();
      
      // Should navigate to main tabs after successful registration
      await waitFor(element(by.text('Carte')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should login with existing user', async () => {
      await element(by.placeholder('Email')).typeText('test@example.com');
      await element(by.placeholder('Mot de passe')).typeText('Test123456');
      await element(by.text('Se connecter')).tap();
      
      await waitFor(element(by.text('Carte')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Map and Address Management', () => {
    beforeEach(async () => {
      // Login first
      await element(by.placeholder('Email')).typeText('test@example.com');
      await element(by.placeholder('Mot de passe')).typeText('Test123456');
      await element(by.text('Se connecter')).tap();
      await waitFor(element(by.text('Carte')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display map with user location', async () => {
      // The map should be visible
      await expect(element(by.type('RCTMap'))).toBeVisible();
    });

    it('should navigate to create address screen', async () => {
      // Tap the add button
      await element(by.id('add-address-button')).tap();
      
      await expect(element(by.text('Nouvelle Adresse'))).toBeVisible();
      await expect(element(by.text('📍 Position sur la carte'))).toBeVisible();
    });

    it('should create a new address', async () => {
      await element(by.id('add-address-button')).tap();
      
      // Fill in address details
      await element(by.placeholder('Ex: Mon restaurant préféré')).typeText('Restaurant Test E2E');
      await element(by.placeholder('Décrivez cette adresse...')).typeText('Un excellent restaurant pour les tests');
      
      // Select location on map (tap center of map)
      await element(by.type('RCTMap')).tap({ x: 200, y: 100 });
      
      // Toggle public switch
      await element(by.id('public-switch')).tap();
      
      // Create the address
      await element(by.text('Créer')).tap();
      
      // Should return to map
      await waitFor(element(by.type('RCTMap')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should display created address in My Addresses tab', async () => {
      // Navigate to My Addresses tab
      await element(by.text('Mes Adresses')).tap();
      
      await expect(element(by.text('Restaurant Test E2E'))).toBeVisible();
      await expect(element(by.text('Un excellent restaurant pour les tests'))).toBeVisible();
    });

    it('should filter addresses by visibility', async () => {
      await element(by.text('Mes Adresses')).tap();
      
      // Filter by public addresses
      await element(by.text('Publiques')).tap();
      await expect(element(by.text('Restaurant Test E2E'))).toBeVisible();
      
      // Filter by private addresses
      await element(by.text('Privées')).tap();
      // The test restaurant should not be visible if it was created as public
    });
  });

  describe('Address Details and Comments', () => {
    beforeEach(async () => {
      // Login and navigate to an address
      await element(by.placeholder('Email')).typeText('test@example.com');
      await element(by.placeholder('Mot de passe')).typeText('Test123456');
      await element(by.text('Se connecter')).tap();
      await waitFor(element(by.text('Carte')))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.text('Mes Adresses')).tap();
      await element(by.text('Restaurant Test E2E')).tap();
    });

    it('should display address details', async () => {
      await expect(element(by.text('Restaurant Test E2E'))).toBeVisible();
      await expect(element(by.text('Un excellent restaurant pour les tests'))).toBeVisible();
      await expect(element(by.text('Commentaires'))).toBeVisible();
    });

    it('should add a comment to an address', async () => {
      // Open comment form
      await element(by.id('add-comment-button')).tap();
      
      // Write a comment
      await element(by.placeholder('Écrire un commentaire...')).typeText('Excellent endroit, je recommande !');
      
      // Submit comment
      await element(by.text('Publier')).tap();
      
      // Comment should be visible
      await waitFor(element(by.text('Excellent endroit, je recommande !')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should delete a comment', async () => {
      // Find and delete the comment
      await element(by.id('delete-comment-button')).atIndex(0).tap();
      await element(by.text('Supprimer')).tap();
      
      // Comment should be removed
      await waitFor(element(by.text('Excellent endroit, je recommande !')))
        .not.toBeVisible()
        .withTimeout(3000);
    });

    it('should delete an address', async () => {
      // Delete the address
      await element(by.id('delete-address-button')).tap();
      await element(by.text('Supprimer')).tap();
      
      // Should navigate back to My Addresses
      await waitFor(element(by.text('Mes Adresses')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Address should not be visible anymore
      await expect(element(by.text('Restaurant Test E2E'))).not.toBeVisible();
    });
  });

  describe('Public Addresses Discovery', () => {
    beforeEach(async () => {
      // Login
      await element(by.placeholder('Email')).typeText('test@example.com');
      await element(by.placeholder('Mot de passe')).typeText('Test123456');
      await element(by.text('Se connecter')).tap();
      await waitFor(element(by.text('Carte')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should navigate to discover tab', async () => {
      await element(by.text('Découvrir')).tap();
      await expect(element(by.text('Découvrir'))).toBeVisible();
      await expect(element(by.text('Adresses de la communauté'))).toBeVisible();
    });

    it('should search for addresses', async () => {
      await element(by.text('Découvrir')).tap();
      
      // Open search
      await element(by.id('search-button')).tap();
      
      // Type search query
      await element(by.placeholder('Rechercher une adresse...')).typeText('Restaurant');
      
      // Results should be filtered
      // Note: This assumes there are public addresses with "Restaurant" in the name
    });
  });

  describe('Profile Management', () => {
    beforeEach(async () => {
      // Login
      await element(by.placeholder('Email')).typeText('test@example.com');
      await element(by.placeholder('Mot de passe')).typeText('Test123456');
      await element(by.text('Se connecter')).tap();
      await waitFor(element(by.text('Carte')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Navigate to profile
      await element(by.text('Profil')).tap();
    });

    it('should display user profile', async () => {
      await expect(element(by.text('Mon Profil'))).toBeVisible();
      await expect(element(by.text('test@example.com'))).toBeVisible();
    });

    it('should update user display name', async () => {
      // Clear and update display name
      await element(by.placeholder("Nom d'utilisateur")).clearText();
      await element(by.placeholder("Nom d'utilisateur")).typeText('Updated Name');
      
      // Save changes
      await element(by.text('Mettre à jour')).tap();
      
      // Success alert should appear
      await waitFor(element(by.text('Succès')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should logout successfully', async () => {
      await element(by.text('Se déconnecter')).tap();
      await element(by.text('Oui')).tap();
      
      // Should return to login screen
      await waitFor(element(by.text('Connexion')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });
});
