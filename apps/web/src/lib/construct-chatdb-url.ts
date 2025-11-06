import { CHATDB_URL } from 'astro:env/client';

interface ConstructChatdbUrlProps {
  appId: string;
  chartId: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
  hideTitle?: boolean;
  hideXAxis?: boolean;
  hideYAxis?: boolean;
  customTitle?: string;
}

/**
 * Construct a full ChatDB embed URL for a specific app/chart.
 * Example:
 *   constructChatdbUrl({
 *     appId: "123",
 *     chartId: "456",
 *     hideHeader: true,
 *     customTitle: "Top 10 Crocodile Species"
 *   })
 * → "https://chatdb.io/embed/apps/123/charts/456?hideHeader=true&customTitle=Top%2010%20Crocodile%20Species"
 */
export function constructChatdbUrl({
  appId,
  chartId,
  hideHeader,
  hideFooter,
  hideTitle,
  hideXAxis,
  hideYAxis,
  customTitle,
}: ConstructChatdbUrlProps): string {
  if (!appId || !chartId) {
    throw new Error('Both appId and chartId are required to construct the URL.');
  }

  const params = new URLSearchParams();

  if (hideHeader) params.set('hideHeader', 'true');
  if (hideFooter) params.set('hideFooter', 'true');
  if (hideTitle) params.set('hideTitle', 'true');
  if (hideXAxis) params.set('hideXAxis', 'true');
  if (hideYAxis) params.set('hideYAxis', 'true');

  if (customTitle) {
    params.set('customTitle', encodeURIComponent(customTitle));
  }

  const query = params.toString();
  const base = `${CHATDB_URL}/embed/apps/${appId}/charts/${chartId}`;

  return query ? `${base}?${query}` : base;
}
