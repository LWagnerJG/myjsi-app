import React from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { BookOpen, MessageSquare, Phone } from 'lucide-react';

export const HelpScreen = ({ theme }) => {
    const helpTopics = [
        {
            icon: BookOpen,
            title: "User Guide",
            description: "Find detailed instructions on how to use all the features of the MyJSI app.",
            action: "Read Guide"
        },
        {
            icon: MessageSquare,
            title: "FAQs",
            description: "Browse frequently asked questions to find quick answers.",
            action: "View FAQs"
        },
        {
            icon: Phone,
            title: "Contact Support",
            description: "Get in touch with our support team for personalized assistance.",
            action: "Contact Us"
        }
    ];

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <PageTitle title="Help & Support" theme={theme} />
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-hide">
                {helpTopics.map((topic, index) => (
                    <GlassCard key={index} theme={theme} className="p-4">
                        <div className="flex items-start space-x-4">
                            <div
                                className="p-3 rounded-full"
                                style={{ backgroundColor: theme.colors.subtle }}
                            >
                                <topic.icon className="w-6 h-6" style={{ color: theme.colors.accent }} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                                    {topic.title}
                                </h3>
                                <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                                    {topic.description}
                                </p>
                                <button
                                    className="mt-3 text-sm font-semibold"
                                    style={{ color: theme.colors.accent }}
                                >
                                    {topic.action}
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};