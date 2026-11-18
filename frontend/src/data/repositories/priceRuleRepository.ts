import { apiRequest } from '@/data/api/client';
import type { PriceRule, UpdatePriceRuleInput } from '@/models/venue';

export const priceRuleRepository = {
  update(id: number, input: UpdatePriceRuleInput) {
    return apiRequest<PriceRule>(`/price-rules/${id}`, {
      method: 'PATCH',
      body: input,
    });
  },
};
