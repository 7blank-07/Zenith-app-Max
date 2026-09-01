import { createRedeemRouteModule } from '../../components/redeem/RedeemCodeRoutePage';
import { REDEEM_ROUTE_KEY } from '../../../src/lib/server/redeem-codes/constants.mjs';
import { REDEEM_ROUTE_REVALIDATE_SECONDS } from '../../../src/lib/server/redeem-codes/seo.mjs';

export const revalidate = REDEEM_ROUTE_REVALIDATE_SECONDS;

const { generateMetadata, Page } = createRedeemRouteModule(REDEEM_ROUTE_KEY.MALAYSIA);

export { generateMetadata };
export default Page;
