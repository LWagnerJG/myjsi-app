/**
 * Shared Cloudinary URL builder for JSI product / series imagery.
 * Cloud name and transform presets live here so screens stop hardcoding bases.
 */

export const CLOUDINARY_CLOUD_NAME = 'jasper-jsi-furniture';
export const CLOUDINARY_UPLOAD_BASE = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

const SIZE_TRANSFORMS = {
  thumb: 't_thumbnail/c_limit,w_256',
  medium: 't_medium/c_fill,w_640,h_640,g_auto',
  large: 't_large/c_limit,w_1200',
  pad: 'c_pad,w_660,h_495,b_white',
};

/**
 * @param {string} publicId - Cloudinary public id (no leading slash)
 * @param {'thumb'|'medium'|'large'|'pad'|string} [sizeOrTransform]
 * @param {{ version?: string|number, format?: string|false, quality?: string|false }} [opts]
 * @returns {string}
 */
export const cloudinaryImageUrl = (publicId, sizeOrTransform = 'medium', opts = {}) => {
  if (!publicId) return '';
  const preset = SIZE_TRANSFORMS[sizeOrTransform];
  const transform = preset || sizeOrTransform;
  const version = opts.version == null ? 'v1' : `v${opts.version}`;
  // Custom transform strings may already include f_/q_ — don't double-append.
  const isCustom = !preset;
  const format = opts.format === false || (isCustom && /(?:^|\/)f_/.test(transform))
    ? ''
    : `f_${opts.format || 'auto'}`;
  const quality = opts.quality === false || (isCustom && /(?:^|\/)q_/.test(transform))
    ? ''
    : `q_${opts.quality || 'auto'}`;
  const parts = [transform, format, quality, version, publicId].filter(Boolean);
  return `${CLOUDINARY_UPLOAD_BASE}/${parts.join('/')}`;
};

/** Thumbnail transform prefix used by Products family list images. */
export const CLOUDINARY_THUMB_PREFIX = `${CLOUDINARY_UPLOAD_BASE}/${SIZE_TRANSFORMS.thumb}/f_auto/q_auto/v1`;
