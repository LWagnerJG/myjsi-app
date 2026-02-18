// Resources feature specific data (migrated from root data folder)
export const RESOURCES_DATA = [
    {
        category: "Product & Finish Resources",
        items: [
            { label: "Lead Times", nav: "resources/lead-times" },
            { label: "Search Fabrics", nav: "resources/search-fabrics" },
            { label: "Request COM Yardage", nav: "resources/request-com-yardage" },
            { label: "Discontinued Finishes Database", nav: "resources/discontinued-finishes" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Sales & Rep Tools",
        items: [
            { label: "Dealer Directory", nav: "resources/dealer-directory" },
            { label: "Commission Rates", nav: "resources/commission-rates" },
            { label: "Sample Discounts", nav: "resources/sample-discounts" },
            { label: "Contracts", nav: "resources/contracts" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Dealer & Field Support",
        items: [
            { label: "Loaner Pool", nav: "resources/loaner-pool" },
            { label: "New Dealer Sign-Up", nav: "resources/new-dealer-signup" },
            { label: "Request Field Visit", nav: "resources/request-field-visit" },
            { label: "Install Instructions", nav: "resources/install-instructions" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Marketing & Communication",
        items: [
            { label: "Presentations", nav: "resources/presentations" },
            { label: "Social Media", nav: "resources/social-media" },
            { label: "Tradeshows", nav: "resources/tradeshows" },
            { label: "LWYD Marketplace", nav: "marketplace", sublabel: "ElliottBucks rewards shop" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
];
