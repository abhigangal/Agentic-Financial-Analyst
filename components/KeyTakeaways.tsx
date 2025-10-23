import React from 'react';
import { StockAnalysis, EsgAnalysis, MarketIntelligenceAnalysis, LeadershipAnalysis, CalculatedMetric } from '../types';
import { CheckCircleIcon, ArrowTrendingUpIcon, InformationCircleIcon, ExclamationTriangleIcon } from './IconComponents';

interface KeyTakeawaysProps {
    financialAnalysis: StockAnalysis;
    esgAnalysis: EsgAnalysis | null;
    marketIntelligenceAnalysis: MarketIntelligenceAnalysis | null;
    leadershipAnalysis: LeadershipAnalysis | null;
    currencySymbol: string;
}

const formatPrice = (price: number | null, currencySymbol: string) => {
    return price === null ? 'N/A' : `${currencySymbol}${price.toFixed(2)}`;
}

const getMetricValue = (metric: CalculatedMetric | number | null): number | null => {
    if (typeof metric === 'number') {
        return metric;
    }
    if (metric && typeof metric === 'object' && 'value' in metric) {
        return metric.value;
    }
    return null;
};

const Takeaway: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
    <li className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">{icon}</div>
        <p className="text-slate-700 dark:text-slate-300">{children}</p>
    </li>
);

export const KeyTakeaways: React.FC<KeyTakeawaysProps> = ({
    financialAnalysis,
    esgAnalysis,
    marketIntelligenceAnalysis,
    leadershipAnalysis,
    currencySymbol,
}) => {
    const takeaways = [];

    // Financial Recommendation Takeaway
    if (financialAnalysis.recommendation !== 'N/A') {
        let recommendationText = `The primary recommendation is to **${financialAnalysis.recommendation}**`;
        const { low, high } = financialAnalysis.target_price.short_term;
        if (low !== null && high !== null) {
            recommendationText += ` with a short-term target range of **${formatPrice(low, currencySymbol)} to ${formatPrice(high, currencySymbol)}**.`;
        } else if (high !== null) {
            recommendationText += ` with a short-term target of **${formatPrice(high, currencySymbol)}**.`;
        } else if (low !== null) {
            recommendationText += ` with a short-term target of **${formatPrice(low, currencySymbol)}**.`;
        } else {
            recommendationText += '.';
        }
        takeaways.push({
            icon: <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" />,
            text: recommendationText
        });
    }

    // Leadership Takeaway
    if (leadershipAnalysis && leadershipAnalysis.overall_assessment !== 'N/A') {
        let leadershipText = `Leadership is assessed as **${leadershipAnalysis.overall_assessment}**.`;
        if (leadershipAnalysis.leadership_recently_changed) {
            leadershipText += ' Note that there have been recent changes in the leadership team.';
        }
        takeaways.push({
            icon: <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
            text: leadershipText
        });
    }

    // Market Intelligence Takeaway
    if (marketIntelligenceAnalysis && marketIntelligenceAnalysis.overall_sentiment !== 'N/A') {
        const sentiment = marketIntelligenceAnalysis.overall_sentiment.toLowerCase();
        let newsText = `Recent news sentiment is broadly **${sentiment}**.`;
        
        if (marketIntelligenceAnalysis.key_articles.length > 0) {
            const topArticle = marketIntelligenceAnalysis.key_articles[0];
            newsText += ` Key stories include themes around "${topArticle.title}".`;
        }
        
        const icon = sentiment === 'positive' 
            ? <InformationCircleIcon className="h-5 w-5 text-sky-500 dark:text-sky-400" /> 
            : <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 dark:text-amber-400" />;

        takeaways.push({
            icon: icon,
            text: newsText
        });
    }

    // ESG Takeaway
    if (esgAnalysis && esgAnalysis.score !== 'N/A') {
        let esgText = `The company has an ESG rating of **${esgAnalysis.score}**, which is considered a strong point.`;
        if (esgAnalysis.score_confidence === 'low') {
            esgText = `The company has a preliminary ESG rating of **${esgAnalysis.score}**, though confidence in this score is low.`;
        }
        takeaways.push({
            icon: <CheckCircleIcon className="h-5 w-5 text-teal-500 dark:text-teal-400" />,
            text: esgText
        });
    }

    // Fallback if no specific takeaways could be generated
    if (takeaways.length === 0) {
        return null;
    }

    return (
        <div className="my-6 p-4 bg-blue-50/70 border border-blue-200 rounded-xl dark:bg-blue-900/20 dark:border-blue-500/30">
            <h3 className="text-lg font-bold text-blue-800 mb-3 dark:text-blue-300">Key Takeaways</h3>
            <ul className="space-y-2">
                {takeaways.slice(0, 4).map((item, index) => (
                    <Takeaway key={index} icon={item.icon}>
                        <span dangerouslySetInnerHTML={{ __html: item.text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-slate-100">$1</strong>') }} />
                    </Takeaway>
                ))}
            </ul>
        </div>
    );
};
