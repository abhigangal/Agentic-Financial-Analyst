

import { inMarketConfig } from './in';
import { usMarketConfig } from './us';
import { ukMarketConfig } from './uk';
import { belfastMarketConfig } from './belfast';
import { MarketConfig } from '../../types';

export const marketConfigs: Record<string, MarketConfig> = {
  [inMarketConfig.id]: inMarketConfig,
  [usMarketConfig.id]: usMarketConfig,
  [ukMarketConfig.id]: ukMarketConfig,
  [belfastMarketConfig.id]: belfastMarketConfig,
};

export type { MarketConfig };