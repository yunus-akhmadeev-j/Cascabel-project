export class HomePresenter {
    constructor(view, model) {
        this.view = view;
        this.model = model;
        this.currentPage = 1;
    }

    async initialize() {
        try {
            const styles = await this.model.getStyles();
            this.view.renderStyles(styles, (index) => this.activateCard(index));
        } catch (error) {
            console.error('Failed to initialize styles:', error);
            this.view.renderStyles([], (index) => this.activateCard(index));
        }

        try {
            const services = await this.model.getServices();
            console.log('Services data:', services); // Отладочный лог
            this.view.renderServices(services);
        } catch (error) {
            console.error('Failed to initialize services:', error);
            this.view.renderServices([]);
        }

        try {
            const designers = await this.model.getDesigners();
            this.view.renderDesigners(designers, (id) => this.showDesignerCard(id));
        } catch (error) {
            console.error('Failed to initialize designers:', error);
            this.view.renderDesigners([], (id) => this.showDesignerCard(id));
        }

        try {
            const topUsers = await this.model.getTopUsers();
            this.view.renderTopUsers(topUsers, () => this.showFullUsersList());
        } catch (error) {
            console.error('Failed to initialize top users:', error);
            this.view.renderTopUsers([], () => this.showFullUsersList());
        }

        try {
            const recentOrders = await this.model.getRecentCompletedOrders();
            this.view.renderRecentOrders(recentOrders, (id) => this.showOrderDetails(id));
        } catch (error) {
            console.error('Failed to initialize recent orders:', error);
            this.view.renderRecentOrders([], (id) => this.showOrderDetails(id));
        }

        try {
            const interiorStyles = await this.model.getStyles();
            this.view.renderInteriorStyles(interiorStyles);
        } catch (error) {
            console.error('Failed to initialize interior styles:', error);
            this.view.renderInteriorStyles([]);
        }
    }
    activateCard(index) {
        this.view.activateCard(index);
    }

    async showDesignerCard(id) {
        try {
            const designer = await this.model.getDesignerById(id);
            if (designer) {
                this.view.showDesignerCard(designer);
            }
        } catch (error) {
            console.error('Failed to show designer card:', error);
        }
    }

    async showOrderDetails(id) {
        try {
            const order = await this.model.getOrderById(id);
            if (order) {
                this.view.showOrderDetails(order);
            }
        } catch (error) {
            console.error('Failed to show order details:', error);
        }
    }

    async showFullUsersList() {
        try {
            const topUsers = await this.model.getTopUsers();
            this.view.renderFullUsersList(
                topUsers,
                this.currentPage,
                (page) => this.changeUsersPage(page),
                () => this.closeFullUsersList()
            );
        } catch (error) {
            console.error('Failed to show full users list:', error);
            this.view.renderFullUsersList(
                [],
                this.currentPage,
                (page) => this.changeUsersPage(page),
                () => this.closeFullUsersList()
            );
        }
    }

    changeUsersPage(page) {
        this.currentPage = page;
        this.showFullUsersList();
    }

    closeFullUsersList() {
        this.view.closeFullUsersList();
    }
}