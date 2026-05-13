import untradableBadgeImage from '../../assets/images/untradable_img.png';
import untradableFlagImage from '../../assets/images/untradable-red-flag.png';
import greenRankSimpleImage from '../../assets/images/rank_simple/green_rank_simple.png';
import blueRankSimpleImage from '../../assets/images/rank_simple/blue_rank_simple.png';
import purpleRankSimpleImage from '../../assets/images/rank_simple/purple_rank_simple.png';
import redRankSimpleImage from '../../assets/images/rank_simple/red_rank_simple.png';
import orangeRankSimpleImage from '../../assets/images/rank_simple/orange_gold_simple.png';
import greenRankSpriteImage from '../../assets/images/ranks/green_rank_enhanced_main.webp';
import blueRankSpriteImage from '../../assets/images/ranks/blue_rank_enhanced_main.webp';
import purpleRankSpriteImage from '../../assets/images/ranks/purple_rank_enhanced_main.webp';
import redRankSpriteImage from '../../assets/images/ranks/red_rank_enhanced_main.webp';
import goldRankSpriteImage from '../../assets/images/ranks/gold_rank_enhanced_main.webp';

export const UNTRADABLE_BADGE_IMAGE_URL = untradableBadgeImage.src;
export const UNTRADABLE_FLAG_IMAGE_URL = untradableFlagImage.src;

export const RANK_SIMPLE_ICON_URLS = Object.freeze({
  1: greenRankSimpleImage.src,
  2: blueRankSimpleImage.src,
  3: purpleRankSimpleImage.src,
  4: redRankSimpleImage.src,
  5: orangeRankSimpleImage.src
});

export const RANK_SPRITE_IMAGE_URLS = Object.freeze({
  1: greenRankSpriteImage.src,
  2: blueRankSpriteImage.src,
  3: purpleRankSpriteImage.src,
  4: redRankSpriteImage.src,
  5: goldRankSpriteImage.src
});
