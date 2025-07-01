import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  onClick, 
  isClickable = false,
  trend = null, // 'up', 'down', or null
  trendValue = null,
  progress = null, // 0-100 for progress bar
  subtitle = null
}) => {
  const CardComponent = isClickable ? Card : Card;
  
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-500';
  };
  
  return (
    <CardComponent 
      className={`w-full max-w-full ${isClickable ? 'cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]' : ''} bg-gradient-to-br from-white to-gray-50 border border-gray-200`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? `$${value.toFixed(2)}` : value}
            </div>
            {trend && (
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                {trendValue && (
                  <span className={`text-sm font-medium ${getTrendColor()}`}>
                    {trendValue > 0 ? '+' : ''}{trendValue}%
                  </span>
                )}
              </div>
            )}
          </div>
          
          {subtitle && (
            <div className="text-sm text-gray-500">{subtitle}</div>
          )}
          
          {progress !== null && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </CardComponent>
  );
}; 