// =========================================================================
// PBS Admin App and Routes Configuration
// =========================================================================

(function () {
    'use strict';

    var app = angular.module('pbs');

    app.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {

        /* Views Path */
        var adminViewPath = "/PBS-UserPortal/app/admin/modules/";
        var loginViewPath = "/PBS-UserPortal/app/login/";
        /*var resetPasswordSuccessViewPath = "/PBS-UserPortal/app/resetpassword-success/";*/
       /* var resetPasswordViewPath = /PBS-UserPortal/app/resetpassword/*/

        $urlRouterProvider.otherwise("/login");

        $stateProvider

        /* States for Admin Screens */
            .state('login', {
                url: '/login',
                templateUrl: loginViewPath + 'login.html',
                controller: 'LoginController',
                containerClass: 'login-content ng-scope'
            })

            .state('core', {
                url: '/core',
                redirectTo: 'resetpassword.html',
                containerClass: 'login-content ng-scope'
            })

            .state('403', {
                url: '/403',
                templateUrl: '/PBS-UserPortal/app/admin/common/403.html',
                controller: '403Controller',
                containerClass: 'four-zero-content'
            })

            .state('dashboard', {
                url: '/dashboard',
                templateUrl: '/PBS-UserPortal/app/admin/common/dashboard.html',
                controller: 'DashBoard',
                containerClass: 'four-zero-content'
            })
            
            .state('admin', {
                url: '/admin',
                templateUrl: adminViewPath + 'admin.html',
                controller: 'AdminController',
                containerClass: 'sw-toggled'
            })

            /*.state('resetpassword-success', {
                url: '/resetpassword-success',
                templateUrl: resetPasswordSuccessViewPath + 'success.html',
                controller: 'resetPasswordSuccess',
                containerClass: 'login-content ng-scope'
            })*/

            .state("admin.members", {
                url: "/members",
                templateUrl: adminViewPath + 'members/members.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.members.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'members/manage.html',
                controller: 'ManageMembers',
                containerClass: 'sw-toggled'
            })

            .state("admin.members.add", {
                url: "/add",
                templateUrl: adminViewPath + 'members/add.html',
                controller: 'AddMember',
                containerClass: 'sw-toggled'
            })

            .state("admin.members.edit", {
                url: "/edit/:id",
                templateUrl: adminViewPath + 'members/edit.html',
                controller: 'EditMember',
                containerClass: 'sw-toggled'
            })

            .state("admin.employees", {
                url: "/employees",
                templateUrl: adminViewPath + 'employees/employees.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.employees.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'employees/manage.html',
                controller: 'ManageEmployees',
                containerClass: 'sw-toggled'
            })

            .state("admin.employees.add", {
                url: "/add",
                templateUrl: adminViewPath + 'employees/add.html',
                controller: 'AddEmployees',
                containerClass: 'sw-toggled'
            })

            .state("admin.employees.edit", {
                url: "/edit/:id",
                templateUrl: adminViewPath + 'employees/edit.html',
                controller: 'EditEmployee',
                containerClass: 'sw-toggled'
            })

            .state("admin.profile", {
                url: "/profile",
                templateUrl: adminViewPath + 'profile/profile.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.profile.edit", {
                url: "/edit",
                templateUrl: adminViewPath + 'profile/edit.html',
                controller: 'EditProfile',
                containerClass: 'sw-toggled'
            })

            .state("admin.docking-stations.docking-station-more-details", {
                url: "/docking-station-more-details/:id",
                templateUrl: adminViewPath + 'docking-stations/docking-station-more-details.html',
                controller: 'DockingStationMoreDetails',
                containerClass: 'sw-toggled'
            })

            .state("admin.docking-units", {
                url: "/docking-units",
                templateUrl: adminViewPath + 'docking-units/docking-units.html',
                containerClass: 'sw-toggled'
            })
            .state("admin.docking-units.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'docking-units/manage.html',
                controller: 'ManageDockingUnit',
                containerClass: 'sw-toggled'
            })
            .state("admin.docking-units.add", {
                url: "/add",
                templateUrl: adminViewPath + 'docking-units/add.html',
                controller: 'AddDockingUnit',
                containerClass: 'sw-toggled'
            })
            .state("admin.docking-units.edit", {
                url: "/edit/:id",
                templateUrl: adminViewPath + 'docking-units/edit.html',
                controller: 'EditDockingUnit',
                containerClass: 'sw-toggled'
            })

            // Stations
            .state("admin.stations", {
                url: "/stations",
                templateUrl: adminViewPath + 'stations/stations.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.stations.view-stations", {
                url: "/view-stations",
                templateUrl: adminViewPath + 'stations/view-stations.html',
                controller: 'DockingStations',
                containerClass: 'sw-toggled'
            })

            // Plans
            .state("admin.plans", {
                url: "/plans",
                templateUrl: adminViewPath + 'plans/plans.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.plans.view-plans", {
                url: "/view-plans",
                templateUrl: adminViewPath + 'plans/view-plans.html',
                controller: 'SelectPlans',
                containerClass: 'sw-toggled'
            })

            //ride history
            .state("admin.ride-history", {
                url: "/ride-history",
                templateUrl: adminViewPath + 'ride-history/ride-history.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.ride-history.view-history", {
                url: "/view-history",
                templateUrl: adminViewPath + 'ride-history/view-history.html',
                controller: 'RideHistory',
                containerClass: 'sw-toggled'
            })

            // payment history
            .state("admin.payment-history", {
                url: "/payment-history",
                templateUrl: adminViewPath + 'payment-history/payment-history.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.payment-history.view-payments", {
                url: "/view-payments",
                templateUrl: adminViewPath + 'payment-history/view-payments.html',
                controller: 'PaymentHistory',
                containerClass: 'sw-toggled'
            })

            // change password
            .state("admin.change-password", {
                url: "/change-password",
                templateUrl: adminViewPath + 'change-password/passwordchange.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.change-password.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'change-password/manage.html',
                controller: 'PasswordChange',
                containerClass: 'sw-toggled'
            })

            //feedback
            .state("admin.feedback", {
                url: "/feedback",
                templateUrl: adminViewPath + 'feedback/feedback.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.feedback.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'feedback/manage.html',
                controller: 'UserFeedBack',
                containerClass: 'sw-toggled'
            })

            //ccavenu
            .state("admin.ccavenurequest", {
                url: "/ccavenurequest",
                templateUrl: adminViewPath + 'ccavenurequest/ccavenu.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.ccavenurequest.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'ccavenurequest/manage.html',
                controller: 'CCavenu',
                containerClass: 'sw-toggled'
            })

            //home
            .state("admin.home", {
                url: "/home",
                templateUrl: adminViewPath + 'home/home.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.home.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'home/manage.html',
                controller: 'UserHomePage',
                containerClass: 'sw-toggled'
            })

            // topup
            .state("admin.topup", {
                url: "/topup",
                templateUrl: adminViewPath + 'topup/topup.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.topup.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'topup/manage.html',
                controller: 'TopUp',
                containerClass: 'sw-toggled'
            })


            .state("admin.docking-ports", {
                url: "/docking-ports",
                templateUrl: adminViewPath + 'docking-ports/docking-ports.html',
                containerClass: 'sw-toggled'
            })
            .state("admin.docking-ports.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'docking-ports/manage.html',
                controller: 'ManageDockingPort',
                containerClass: 'sw-toggled'
            })
            .state("admin.docking-ports.add", {
                url: "/add",
                templateUrl: adminViewPath + 'docking-ports/add.html',
                controller: 'AddDockingPort',
                containerClass: 'sw-toggled'
            })
            .state("admin.docking-ports.edit", {
                url: "/edit/:id",
                templateUrl: adminViewPath + 'docking-ports/edit.html',
                controller: 'EditDockingPort',
                containerClass: 'sw-toggled'
            })

            .state("admin.membership", {
                url: "/membership",
                templateUrl: adminViewPath + 'membership/membership.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.membership.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'membership/manage.html',
                controller: 'ManageMembership',
                containerClass: 'sw-toggled'
            })

            .state("admin.membership.add", {
                url: "/add",
                templateUrl: adminViewPath + 'membership/add.html',
                controller: 'AddMembership',
                containerClass: 'sw-toggled'
            })

            .state("admin.membership.edit", {
                url: "/edit/:id",
                templateUrl: adminViewPath + 'membership/edit.html',
                controller: 'EditMembership',
                containerClass: 'sw-toggled'
            })

            .state("admin.bicycles", {
                url: "/bicycles",
                templateUrl: adminViewPath + 'bicycles/bicycles.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.bicycles.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'bicycles/manage.html',
                controller: 'ManageBicycles',
                containerClass: 'sw-toggled'
            })

            .state("admin.bicycles.add", {
                url: "/add",
                templateUrl: adminViewPath + 'bicycles/add.html',
                controller: 'AddBicycle',
                containerClass: 'sw-toggled'
            })

            .state("admin.bicycles.edit", {
                url: "/edit/:id",
                templateUrl: adminViewPath + 'bicycles/edit.html',
                controller: 'EditBicycle',
                containerClass: 'sw-toggled'
            })
            .state("admin.redistribution-vehicles", {
                url: "/redistribution-vehicles",
                templateUrl: adminViewPath + 'redistribution-vehicles/redistribution-vehicles.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.redistribution-vehicles.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'redistribution-vehicles/manage.html',
                controller: 'ManageRedistributionVehicles',
                containerClass: 'sw-toggled'
            })

            .state("admin.redistribution-vehicles.add", {
                url: "/add",
                templateUrl: adminViewPath + 'redistribution-vehicles/add.html',
                controller: 'AddRedistributionVehicle',
                containerClass: 'sw-toggled'
            })

            .state("admin.redistribution-vehicles.edit", {
                url: "/edit/:id",
                templateUrl: adminViewPath + 'redistribution-vehicles/edit.html',
                controller: 'EditRedistributionVehicle',
                containerClass: 'sw-toggled'
            })

            .state("admin.fare-plans", {
                url: "/fare-plans",
                templateUrl: adminViewPath + 'fare-plan/fare-plan.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.fare-plans.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'fare-plan/manage.html',
                controller: 'ManageFarePlans',
                containerClass: 'sw-toggled'
            })

            .state("admin.fare-plans.add", {
                url: "/add",
                templateUrl: adminViewPath + 'fare-plan/add.html',
                controller: 'AddFarePlan',
                containerClass: 'sw-toggled'
            })

            .state("admin.fare-plans.edit", {
                url: "/edit/:id",
                templateUrl: adminViewPath + 'fare-plan/edit.html',
                controller: 'EditFarePlan',
                containerClass: 'sw-toggled'
            })
            .state("admin.holding-areas", {
                url: "/holding-areas",
                templateUrl: adminViewPath + 'holding-areas/holding-areas.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.holding-areas.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'holding-areas/manage.html',
                controller: 'ManageHoldingAreas',
                containerClass: 'sw-toggled'
            })

            .state("admin.holding-areas.add", {
                url: "/add",
                templateUrl: adminViewPath + 'holding-areas/add.html',
                controller: 'AddHoldingArea',
                containerClass: 'sw-toggled'
            })

            .state("admin.holding-areas.edit", {
                url: "/edit/:id",
                templateUrl: adminViewPath + 'holding-areas/edit.html',
                controller: 'EditHoldingArea',
                containerClass: 'sw-toggled'
            })
            .state("admin.maintenance-centres", {
                url: "/maintenance-centres",
                templateUrl: adminViewPath + 'maintenance-centres/maintenance-centres.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.maintenance-centres.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'maintenance-centres/manage.html',
                controller: 'ManageMaintenanceCentres',
                containerClass: 'sw-toggled'
            })

            .state("admin.maintenance-centres.add", {
                url: "/add",
                templateUrl: adminViewPath + 'maintenance-centres/add.html',
                controller: 'AddMaintenanceCentre',
                containerClass: 'sw-toggled'
            })

            .state("admin.maintenance-centres.edit", {
                url: "/edit/:id",
                templateUrl: adminViewPath + 'maintenance-centres/edit.html',
                controller: 'EditMaintenanceCentre',
                containerClass: 'sw-toggled'
            })

            /*Registration centres*/
            .state("admin.registration-centres",{
                url:"/registration-centres",
                templateUrl:adminViewPath + 'registration-centres/registration-centres.html',
                containerClass:'sw-toggled'
                })

            .state("admin.registration-centres.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'registration-centres/manage.html',
                controller: 'ManageRegistrationCentres',
                containerClass: 'sw-toggled'
            })

            .state("admin.registration-centres.add", {
                url: "/add",
                templateUrl: adminViewPath + 'registration-centres/add.html',
                controller: 'AddRegistrationCentre',
                containerClass: 'sw-toggled'
            })

            .state("admin.registration-centres.edit", {
                url: "/edit/:id",
                templateUrl: adminViewPath + 'registration-centres/edit.html',
                controller: 'EditRegistrationCentre',
                containerClass: 'sw-toggled'
            })

            /*Tickets*/
            .state("admin.tickets",{
                url:"/tickets",
                templateUrl:adminViewPath + 'tickets/tickets.html',
                containerClass:'sw-toggled'
            })

            .state("admin.tickets.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'tickets/manage.html',
                controller: 'ViewTickets',
                containerClass: 'sw-toggled'
            })

            /*Ports test*/
            .state("admin.ports-testing",{
                url:"/ports-testing",
                templateUrl:adminViewPath + 'ports-testing/porttest-manage.html',
                containerClass:'sw-toggled'
            })

            .state("admin.ports-testing.test", {
                url: "/test",
                templateUrl: adminViewPath + 'ports-testing/test.html',
                controller: 'AddCheckInCheckOut',
                containerClass: 'sw-toggled'
            })

            /*check in check out - bridge*/
            .state("admin.checkincheckout-bridge",{
                url:"/checkincheckout-bridge",
                templateUrl:adminViewPath + 'checkincheckout-bridge/manage.html',
                containerClass:'sw-toggled'
            })

            .state("admin.checkincheckout-bridge.checkincheckout", {
                url: "/checkincheckout",
                templateUrl: adminViewPath + 'checkincheckout-bridge/checkincheckout.html',
                controller: 'CheckInCheckOutBridge',
                containerClass: 'sw-toggled'
            })


            /*KPI*/
            .state("admin.kpi",{
                url:"/kpi",
                templateUrl:adminViewPath+'kpi/kpi-manage.html',
                containerClass:'sw-toggled'
            })

            .state("admin.kpi.dash-board",{
                url:"/dash-board",
                templateUrl: adminViewPath + 'kpi/dash-board.html',
                controller: 'kpiDetails',
                containerClass: 'sw-toggled'
            })

            /*Miantenance*/
            .state("admin.maintenance",{
                url:"/maintenance",
                templateUrl:adminViewPath + 'maintenance/manage.html',
                containerClass:'sw-toggled'
            })

            .state("admin.maintenance.manage-view",{
                url:"/manage-view",
                templateUrl:adminViewPath + 'maintenance/manage-view.html',
                controller:'AddDockingStationCleanManage',
                containerClass:'sw-toggled'
            })

            .state("admin.maintenance.add",{
                url:"/add",
                templateUrl:adminViewPath + 'maintenance/add.html',
                controller:'AddDockingStationClean',
                containerClass:'sw-toggled'
            })


            .state("admin.maintenance.new-design", {
                url: "/maintenance/new-design",
                templateUrl: adminViewPath + 'maintenance/new-design/manage.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.maintenance.new-design.manageview",{
                url:"/manageview",
                templateUrl:adminViewPath + 'maintenance/new-design/manageview.html',
                controller:'DockingStationStationNewDesign',
                containerClass:'sw-toggled'
            })

            .state("admin.maintenance.dockingstationcleaning-report",{
                url:"/dockingstationcleaning-report",
                templateUrl:adminViewPath + 'maintenance/dockingstationcleaning-report.html',
                controller:'AddDockingStationCleanReport',
                containerClass:'sw-toggled'
            })

            .state("admin.maintenance.dockingstationcleaning-report-print",{
                url:"/dockingstationcleaning-report-print",
                templateUrl:adminViewPath + 'maintenance/dockingstationcleaning-report-print.html',
                controller:'AddDockingStationCleanReportPrint',
                containerClass:'sw-toggled'
            })

                // global ticket type
            .state("admin.settings",{
                url:"/settings",
                templateUrl:adminViewPath + 'settings/manage.html',
                containerClass:'sw-toggled'
            })

            .state("admin.settings.ticket-type", {
                url: "/settings/ticket-type",
                templateUrl: adminViewPath + 'settings/ticket-type/type.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.settings.ticket-type.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'settings/ticket-type/manage.html',
                controller:'TicketTypeManage',
                containerClass: 'sw-toggled'
            })
            .state("admin.settings.ticket-type.add", {
                url: "/add",
                templateUrl: adminViewPath + 'settings/ticket-type/add.html',
                controller:'TicketTypeAdd',
                containerClass: 'sw-toggled'
            })
            .state("admin.settings.ticket-type.edit", {
                url: "/edit",
                templateUrl: adminViewPath + 'settings/ticket-type/edit.html',
                controller:'SettingTypeEdit',
                containerClass: 'sw-toggled'
            })


            // bicycle maintenance report
            .state("admin.maintenance.bicycle-maintenance",{
                url:"/maintenance/bicycle-manage",
                templateUrl:adminViewPath + 'maintenance/bicycle-maintenance/bicycle-manage.html',
                controller:'BicycleMaintenanceManage',
                containerClass:'sw-toggled'
            })

            .state("admin.maintenance.bicycle-maintenance.report",{
                url:"/report",
                templateUrl:adminViewPath + 'maintenance/bicycle-maintenance/report.html',
                controller:'BicycleMaintenanceReport',
                containerClass:'sw-toggled'
            })
            .state("admin.maintenance.bicycle-maintenance.report-print",{
                url:"/report-print",
                templateUrl:adminViewPath + 'maintenance/bicycle-maintenance/report-print.html',
                controller:'BicycleMaintenanceReportPrint',
                containerClass:'sw-toggled'
            })

            /*Accounts*/
            .state("admin.accounts", {
                url: "/accounts",
                templateUrl: adminViewPath + 'accounts/accounts.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.accounts.cash-collectionsummary", {
                url: "/cash-collectionsummary",
                templateUrl: adminViewPath + 'accounts/cash-collectionsummary.html',
                controller: 'CashCollectionSummary',
                containerClass: 'sw-toggled'
            })

            .state("admin.accounts.daywise-collectionsummary", {
                url: "/daywise-collectionsummary",
                templateUrl: adminViewPath + 'accounts/daywise-collectionsummary.html',
                controller: 'dayWiseCollectionSummary',
                containerClass: 'sw-toggled'
            })

            .state("admin.accounts.refunds", {
                url: "/refunds",
                templateUrl: adminViewPath + 'accounts/refunds.html',
                controller: 'refundsSummary',
                containerClass: 'sw-toggled'
            })

            .state("admin.accounts.totalcash-report", {
                url: "/totalcash-report",
                templateUrl: adminViewPath + 'accounts/totalcash-report.html',
                controller: 'totalCashReport',
                containerClass: 'sw-toggled'
            })


            /*bank*/
            .state("admin.accounts.bankcashdeposits", {
                url: "/accounts/bankcashdeposits",
                templateUrl: adminViewPath + 'accounts/bankcashdeposits/bankcash.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.accounts.bankcashdeposits.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'accounts/bankcashdeposits/manage.html',
                controller: 'ManageBankCashDeposits',
                containerClass: 'sw-toggled'
            })

            .state("admin.accounts.bankcashdeposits.add", {
                url: "/add",
                templateUrl: adminViewPath + 'accounts/bankcashdeposits/add.html',
                controller: 'AddBankCashDeposits',
                containerClass: 'sw-toggled'
            })

            .state("admin.accounts.bankcashdeposits.bankcashdeposit-report", {
            url: "/bankcashdeposit-report",
            templateUrl: adminViewPath + 'accounts/bankcashdeposits/bankcashdeposit-report.html',
            controller: 'BankCashDepositReport',
            containerClass: 'sw-toggled'
            })


            .state("admin.accounts.bankcashdeposits.totalcash-report-print", {
                url: "/totalcash-report-print",
                templateUrl: adminViewPath + 'accounts/bankcashdeposits/totalcash-report-print.html',
                controller: 'totalCashReportPrint',
                containerClass: 'sw-toggled'
            })

            .state("admin.accounts.daywise-collectionsummary-report-print", {
                url: "/daywise-collectionsummary-report-print",
                templateUrl: adminViewPath + 'accounts/daywise-collectionsummary-report-print.html',
                controller: 'DaywsieCollectionSummaryReportPrint',
                containerClass: 'sw-toggled'
            })

            .state("admin.accounts.bankcashdeposits.bankcashdeposit-report-print", {
                url: "/bankcashdeposit-report-print",
                templateUrl: adminViewPath + 'accounts/bankcashdeposits/bankcashdeposit-report-print.html',
                controller: 'BankCashDepositReportPrint',
                containerClass: 'sw-toggled'
            })

            /*Registration details*/
            .state("admin.registration-details", {
                url: "/registration-details",
                templateUrl: adminViewPath + 'registration-details/registrationdetails-manage.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.registration-details.registration-details", {
                url: "/registration-details",
                templateUrl: adminViewPath + 'registration-details/registration-details.html',
                controller: 'registrationDetails',
                containerClass: 'sw-toggled'
            })

           /* .state("admin.ports-testing",{
                url:"/ports-testing",
                templateUrl:adminViewPath + 'ports-testing/porttest-manage.html',
                containerClass:'sw-toggled'
            })

            .state("admin.ports-testing.test", {
                url: "/test",
                templateUrl: adminViewPath + 'ports-testing/test.html',
                controller: 'AddCheckInCheckOut',
                containerClass: 'sw-toggled'
            })*/

            .state("admin.smart-cards", {
                url: "/smart-cards",
                templateUrl: adminViewPath + "smart-cards/smart-cards.html"
            })

            .state("admin.smart-cards.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'smart-cards/manage.html',
                controller: 'ManageSmartCards',
                containerClass: 'sw-toggled'
            })
            
            .state("admin.smart-cards.add", {
                url: "/add",
                templateUrl: adminViewPath + 'smart-cards/add.html',
                controller: 'AddSmartCard',
                containerClass: 'sw-toggled'
            })

            .state("admin.smart-cards.edit", {
                url: "/edit/:id",
                templateUrl: adminViewPath + 'smart-cards/edit.html',
                controller: 'EditSmartCard',
                containerClass: 'sw-toggled'
            })

            // other stations (fleet)
            .state("admin.otherstation-fleet", {
                url: "/otherstation-fleet",
                templateUrl: adminViewPath + "otherstation-fleet/otherstation-fleet.html"
            })

            .state("admin.otherstation-fleet.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'otherstation-fleet/manage.html',
                controller: 'OtherStationFleetManage',
                containerClass: 'sw-toggled'
            })

            .state("admin.otherstation-fleet.add", {
                url: "/add",
                templateUrl: adminViewPath + 'otherstation-fleet/add.html',
                controller: 'OtherStationFleetAdd',
                containerClass: 'sw-toggled'
            })

            // other stations (maintenance centre)
            .state("admin.otherstation-maintenance", {
                url: "/otherstation-maintenance",
                templateUrl: adminViewPath + "otherstation-maintenance/otherstation-maintenance.html"
            })

            .state("admin.otherstation-maintenance.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'otherstation-maintenance/manage.html',
                controller: 'OtherStationMaitenanceCentreManage',
                containerClass: 'sw-toggled'
            })

            .state("admin.otherstation-maintenance.add", {
                url: "/add",
                templateUrl: adminViewPath + 'otherstation-maintenance/add.html',
                controller: 'OtherStationMaintenanceCentretAdd',
                containerClass: 'sw-toggled'
            })

            //internal Stations
            .state("admin.internal-stations", {
                url: "/internal-stations",
                templateUrl: adminViewPath + "internal-stations/internal-stations.html"
            })

            .state("admin.internal-stations.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'internal-stations/manage.html',
                controller: 'InternalStationManage',
                containerClass: 'sw-toggled'
            })

            .state("admin.internal-stations.add", {
                url: "/add",
                templateUrl: adminViewPath + 'internal-stations/add.html',
                controller: 'InternalStationAdd',
                containerClass: 'sw-toggled'
            })

            // fleets
            .state("admin.fleets", {
                url: "/fleets",
                templateUrl: adminViewPath + "fleets/fleets.html"
            })

            .state("admin.fleets.manage", {
                url: "/manage",
                templateUrl: adminViewPath + 'fleets/manage.html',
                controller: 'FleetsManage',
                containerClass: 'sw-toggled'
            })

            .state("admin.fleets.add", {
                url: "/add",
                templateUrl: adminViewPath + 'fleets/add.html',
                controller: 'FleetsAdd',
                containerClass: 'sw-toggled'
            })

            .state("admin.fleets.edit", {
                url: "/edit",
                templateUrl: adminViewPath + 'fleets/edit.html',
                controller: 'EditFleets',
                containerClass: 'sw-toggled'
            })


            .state("admin.reports", {
                url: "/reports",
                templateUrl: adminViewPath + 'reports/reports.html',
                containerClass: 'sw-toggled'
            })

            .state("admin.reports.monitor-transactions", {
                url: "/monitor-transactions",
                templateUrl: adminViewPath + 'reports/monitor-transactions.html',
                controller: 'MonitorTransactions',
                containerClass: 'sw-toggled'
            })

            .state("admin.reports.bicycle-availability", {
                url: "/bicycle-availability",
                templateUrl: adminViewPath + 'reports/bicycle-availability.html',
                controller: 'BicycleAvailability',
                containerClass: 'sw-toggled'
            })

            .state("admin.reports.port-status",{
                url:"/port-status",
                templateUrl: adminViewPath + 'reports/port-status.html',
                controller:'PortStatus',
                containerClass:'sw-toggled'
            })

            .state("admin.reports.bicycle-life-cycle", {
                url: "/bicycle-life-cycle",
                templateUrl: adminViewPath + 'reports/bicycle-life-cycle.html',
                controller: 'BicycleLifeCycle',
                containerClass: 'sw-toggled'
            })

            .state("admin.reports.redistribution-vehicle-track", {
                url: "/redistribution-vehicle-track",
                templateUrl: adminViewPath + 'reports/redistribution-vehicle-track.html',
                controller: 'RedistributionVehicleTracking',
                containerClass: 'sw-toggled'
            })

            // Temporary Simulator Routes
            .state("checkout", {
                url: "/simulator/checkout",
                templateUrl: '/PBS-UserPortal/app/simulator/checkout.html',
                controller: 'SimulateCheckout',
                containerClass: 'sw-toggled'
            })

            .state("checkin", {
                url: "/simulator/checkin",
                templateUrl: '/PBS-UserPortal/app/simulator/checkin.html',
                controller: 'SimulateCheckin',
                containerClass: 'sw-toggled'
            })
    }]);

    // Growl Global Configuration
    app.config(["growlProvider", function (growlProvider) {
        growlProvider.globalPosition('bottom-left');
        growlProvider.globalTimeToLive(10000);
        growlProvider.globalDisableCountDown(true);
    }]);

    // Google Maps Global Configuration
    app.config(function (uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyD1lOceuIfGFTiuCPh8_lFM3KhF5pOj_lc',
            v: '3.20',
            libraries: 'weather,geometry,visualization'
        });
    })

})();