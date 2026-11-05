import logo from '@/assets/img/logo.svg';
import garland from '@/assets/img/garland.webp';
import paperclip from '@/assets/img/paperclip.webp';
import goatDance from '@/assets/img/goat-dance.webp';
import goatPeek from '@/assets/img/goat-peek.webp';
import stamp from '@/assets/img/stamp.webp';
import tag from '@/assets/img/tag.webp';
import branch from '@/assets/img/branch.webp';
import seal from '@/assets/img/seal.webp';
import goatGifts from '@/assets/img/goat-gifts.webp';
import goatJump from '@/assets/img/goat-jump.webp';
import goatLantern from '@/assets/img/goat-lantern.webp';
import sealCheck from '@/assets/img/seal-check.svg';
import sealStar from '@/assets/img/seal-star.svg';
import goatStar from '@/assets/img/goat-star.webp';
import goatScroll from '@/assets/img/goat-scroll.webp';
import goatBranch from '@/assets/img/goat-branch.webp';
import goatPoint from '@/assets/img/goat-point.webp';
import goatDanceWink from '@/assets/img/goat-dance-wink.webp';
import prizeW1YandexStation from '@/assets/img/prize-w1-yandex-station.webp';
import prizeW2AirfryerKitfort from '@/assets/img/prize-w2-airfryer-kitfort.webp';
import prizeW3GrillTefal from '@/assets/img/prize-w3-grill-tefal.webp';
import prizeW4CoffeeDelonghi from '@/assets/img/prize-w4-coffee-delonghi.webp';
import prizeW5SteamerKitfort from '@/assets/img/prize-w5-steamer-kitfort.webp';
import prizeW6VacuumPolaris from '@/assets/img/prize-w6-vacuum-polaris.webp';
import prizeW7RobotDreame from '@/assets/img/prize-w7-robot-dreame.webp';
import finalIphone from '@/assets/img/final-iphone.webp';
import finalDyson from '@/assets/img/final-dyson.webp';
import finalTvXiaomi from '@/assets/img/final-tv-xiaomi.webp';
import finalPs5 from '@/assets/img/final-ps5.webp';
import altai from '@/assets/img/altai.webp';
import partner1 from '@/assets/img/partner-1.webp';
import partner2 from '@/assets/img/partner-2.webp';
import partner3 from '@/assets/img/partner-3.webp';
import partner4 from '@/assets/img/partner-4.webp';
import partner5 from '@/assets/img/partner-5.webp';
import partner6 from '@/assets/img/partner-6.webp';
import partner7 from '@/assets/img/partner-7.webp';
import paperGreen from '@/assets/img/paper-green.webp';
import paperCream from '@/assets/img/paper-cream.webp';
import paperRed from '@/assets/img/paper-red.webp';
import snowflake from '@/assets/img/snowflake.svg';
import wavyStitchCream from '@/assets/img/wavy-stitch-cream.svg';
import wavyStitchGreen from '@/assets/img/wavy-stitch-green.svg';
import scallopStitchCream from '@/assets/img/scallop-stitch-cream.svg';
import scallopStitchGreen from '@/assets/img/scallop-stitch-green.svg';
import plaid from '@/assets/img/plaid.webp';

export const images = {
  'logo.svg': logo,
  'garland.webp': garland,
  'paperclip.webp': paperclip,
  'goat-dance.webp': goatDance,
  'goat-peek.webp': goatPeek,
  'stamp.webp': stamp,
  'tag.webp': tag,
  'branch.webp': branch,
  'seal.webp': seal,
  'goat-gifts.webp': goatGifts,
  'goat-jump.webp': goatJump,
  'goat-lantern.webp': goatLantern,
  'seal-check.svg': sealCheck,
  'seal-star.svg': sealStar,
  'goat-star.webp': goatStar,
  'goat-scroll.webp': goatScroll,
  'goat-branch.webp': goatBranch,
  'goat-point.webp': goatPoint,
  'goat-dance-wink.webp': goatDanceWink,
  'prize-w1-yandex-station.webp': prizeW1YandexStation,
  'prize-w2-airfryer-kitfort.webp': prizeW2AirfryerKitfort,
  'prize-w3-grill-tefal.webp': prizeW3GrillTefal,
  'prize-w4-coffee-delonghi.webp': prizeW4CoffeeDelonghi,
  'prize-w5-steamer-kitfort.webp': prizeW5SteamerKitfort,
  'prize-w6-vacuum-polaris.webp': prizeW6VacuumPolaris,
  'prize-w7-robot-dreame.webp': prizeW7RobotDreame,
  'final-iphone.webp': finalIphone,
  'final-dyson.webp': finalDyson,
  'final-tv-xiaomi.webp': finalTvXiaomi,
  'final-ps5.webp': finalPs5,
  'altai.webp': altai,
  'partner-1.webp': partner1,
  'partner-2.webp': partner2,
  'partner-3.webp': partner3,
  'partner-4.webp': partner4,
  'partner-5.webp': partner5,
  'partner-6.webp': partner6,
  'partner-7.webp': partner7,
  'paper-green.webp': paperGreen,
  'paper-cream.webp': paperCream,
  'paper-red.webp': paperRed,
  'snowflake.svg': snowflake,
  'wavy-stitch-cream.svg': wavyStitchCream,
  'wavy-stitch-green.svg': wavyStitchGreen,
  'scallop-stitch-cream.svg': scallopStitchCream,
  'scallop-stitch-green.svg': scallopStitchGreen,
  'plaid.webp': plaid,
};

export function getImage(fileName) {
  const url = images[fileName];
  if (!url) console.warn(`Картинка "${fileName}" не найдена!`);
  return url || '';
}
