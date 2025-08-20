// Resources feature specific data (migrated from root data folder)
export const RESOURCES_DATA = [
    {
        category: "Product & Finish Resources",
        items: [
            { label: "Lead Times", nav: "lead-times" },
            { label: "Search Fabrics", nav: "search-fabrics" },
            { label: "Request COM Yardage", nav: "request-com-yardage" },
            { label: "Discontinued Finishes Database", nav: "discontinued-finishes" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Sales & Rep Tools",
        items: [
            { label: "Dealer Directory", nav: "dealer-directory" },
            { label: "Commission Rates", nav: "commission-rates" },
            { label: "Sample Discounts", nav: "sample-discounts" },
            { label: "Contracts", nav: "contracts" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Dealer & Field Support",
        items: [
            { label: "Loaner Pool", nav: "loaner-pool" },
            { label: "New Dealer Sign-Up", nav: "new-dealer-signup" },
            { label: "Request Field Visit", nav: "request-field-visit" },
            { label: "Install Instructions", nav: "install-instructions" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Marketing & Communication",
        items: [
            { label: "Presentations", nav: "presentations" },
            { label: "Social Media", nav: "social-media" },
            { label: "Design Days", nav: "design-days" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    }
];
