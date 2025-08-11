// Resources related data
export const RESOURCES_DATA = [
    {
        category: "Product & Finish Resources",
        items: [
            { label: "Lead Times", nav: "resources/lead-times" },
            { label: "Search Fabrics", nav: "fabrics/search_form" },
            { label: "Request COM Yardage", nav: "fabrics/com_request" },
            { label: "Discontinued Finishes Database", nav: "resources/discontinued_finishes" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Sales & Rep Tools",
        items: [
            { label: "Dealer Directory", nav: "resources/dealer-directory" },
            { label: "Commission Rates", nav: "resources/commission-rates" },
            { label: "Sample Discounts", nav: "resources/sample_discounts" },
            { label: "Contracts", nav: "resources/contracts" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Dealer & Field Support",
        items: [
            { label: "Loaner Pool", nav: "resources/loaner_pool" },
            { label: "New Dealer Sign-Up", nav: "resources/dealer_registration" },
            { label: "Request Field Visit", nav: "resources/request_field_visit" },
            { label: "Install Instructions", nav: "resources/install_instructions" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Marketing & Communication",
        items: [
            { label: "Presentations", nav: "resources/presentations" },
            { label: "Social Media", nav: "resources/social_media" },
            { label: "Design Days", nav: "resources/design_days" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    }
];

// Note: Feature-specific data has been moved to individual screen data files:
// - Loaner Pool data: src/screens/resources/loaner-pool/data.js
// - Commission Rates data: src/screens/resources/commission-rates/data.js
// - Dealer Directory data: src/screens/resources/dealer-directory/data.js
// - Contracts data: src/screens/resources/contracts/data.js
// - Rewards data: src/screens/resources/rewards/data.js (if needed)