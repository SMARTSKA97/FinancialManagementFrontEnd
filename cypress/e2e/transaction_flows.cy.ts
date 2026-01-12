describe('User Behavior Flows', () => {
    const time = Date.now();
    const email = `cy.test.${time}@example.com`;
    const username = `cyuser${time}`;
    const password = 'Password@123';
    const fullName = 'Cypress Test';
    const dob = '1990-01-01'; // yy-mm-dd

    const accountA = 'Bank Alpha';
    const accountB = 'Bank Beta';

    it('should complete the full lifecycle: Register -> Accounts -> Transfer -> Delete', () => {
        // 1. Register
        cy.visit('/login');
        cy.contains("Don't have an account? Register").click();
        cy.url().should('include', '/register');

        // Updated Selectors for Register.html
        cy.get('input[formControlName="name"]').type(fullName);

        // Datepicker interaction
        cy.get('p-datepicker[formControlName="dateOfBirth"] input').type(dob);
        cy.get('body').click(0, 0); // Close datepicker overlay

        cy.get('input[formControlName="email"]').type(email);
        cy.get('input[formControlName="userName"]').type(username);

        // Password interaction
        cy.get('p-password[formControlName="password"] input').type(password);
        cy.get('body').click(0, 0); // Close password strength overlay

        cy.get('p-password[formControlName="confirmPassword"] input').type(password);

        cy.get('button[type="submit"]').click({ force: true });

        // 2. Login
        cy.url().should('include', '/login');
        cy.get('input[formControlName="userName"]').type(username);
        cy.get('p-password[formControlName="password"] input').type(password);
        cy.get('button[type="submit"]').click({ force: true });

        // 3. Dashboard
        cy.url().should('include', '/dashboard');
        cy.contains('Dashboard'); // Verify we are in

        // 4. Create Account A
        cy.contains('View Accounts').click();
        cy.url().should('include', '/accounts');

        // Add Account A
        cy.contains('button', 'New Account').click();
        cy.get('input[formControlName="name"]').type(accountA);
        cy.get('p-inputnumber[formControlName="balance"] input').type('1000');

        // Select Category (Create new 'General')
        cy.get('p-select[formControlName="accountCategoryId"]').click();
        cy.get('.p-select-overlay input, .p-dropdown-filter').type('General');
        cy.contains(`Create 'General'`).click();

        // WAIT for category creation to finish (Wait for label update)
        cy.get('p-select[formControlName="accountCategoryId"]').should('contain', 'General');

        cy.get('button[type="submit"]').click({ force: true });
        cy.contains(accountA).should('be.visible');

        // Add Account B
        cy.contains('button', 'New Account').click();
        cy.get('input[formControlName="name"]').type(accountB);
        cy.get('p-inputnumber[formControlName="balance"] input').type('0');
        cy.get('p-select[formControlName="accountCategoryId"]').click();
        cy.get('li[role="option"]').contains('General').click();
        cy.get('button[type="submit"]').click({ force: true });
        cy.contains(accountB).should('be.visible');

        // 5. Transactions (Account A)
        cy.contains(accountA).click();

        // Add Expense
        cy.contains('button', 'New Transaction').click();
        cy.get('input[formControlName="description"]').type('Transaction X');
        cy.get('p-inputnumber[formControlName="amount"] input').type('100');

        // Category 'Fun'
        cy.get('p-select[formControlName="transactionCategoryId"]').click();
        cy.get('.p-select-overlay input, .p-dropdown-filter').type('Fun');
        cy.contains(`Create 'Fun'`).click();

        // WAIT for category creation
        cy.get('p-select[formControlName="transactionCategoryId"]').should('contain', 'Fun');

        cy.get('button[type="submit"]').click({ force: true });

        // Verify Dialog Closed & Data Loaded
        cy.get('p-dynamicdialog').should('not.exist');

        // Verify Transaction
        cy.contains('Transaction X').should('be.visible'); // Ensure list updated

        // 6. Switch Account
        cy.contains('tr', 'Transaction X').find('.pi-sync').click();
        // Wait for dialog
        cy.contains('Switch Transaction Account').should('be.visible');

        // Select new account
        cy.get('p-select[formControlName="destinationAccountId"]').click();
        cy.get('li[role="option"]').contains(accountB).click();
        cy.get('button[type="submit"]').click({ force: true });
        // Wait for dialog close
        cy.get('p-dynamicdialog').should('not.exist');


        // Verify removed from A
        cy.contains('Transaction X').should('not.exist');
        // Verify balance A back to 1000 approximately
        cy.get('p-card').should('exist');

        // Verify in B
        cy.visit('/accounts');
        cy.contains(accountB).click();
        cy.contains('Transaction X').should('exist');
        // Check amount in row
        cy.contains('100').should('exist');

        // 7. Delete
        cy.contains('tr', 'Transaction X').find('.pi-trash').click();
        cy.get('button[label="Yes"]').click({ force: true });
        // Verify gone
        cy.contains('Transaction X').should('not.exist');
    });
});
