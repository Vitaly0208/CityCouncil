export const truncate = (text, maxLength, suffix = '...') =>
    text.length > maxLength ? `${text.slice(0, maxLength)}${suffix}` : text;