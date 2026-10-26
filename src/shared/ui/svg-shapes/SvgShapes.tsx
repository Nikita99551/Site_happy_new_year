import { SHAPE_DEFS } from './defs';

/**
 * Невидимый SVG с clip-path-формами плашек. Монтируется один раз в корне приложения,
 * после этого любой элемент может использовать `clip-path: url(#clip-torn-top)` и т. п.
 * Содержимое — статичные пути из макета (defs.ts), поэтому вставка строкой безопасна.
 */
export function SvgShapes() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs dangerouslySetInnerHTML={{ __html: SHAPE_DEFS }} />
    </svg>
  );
}
