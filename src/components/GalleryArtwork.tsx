import { useEffect, useRef, useState } from "react";

/** Draw animated scientific GIFs onto a canvas so pause and reduced motion work. */
export default function GalleryArtwork({
  src,
  alt,
  paused = true,
  className = "",
  onLoad,
}: {
  src: string;
  alt: string;
  paused?: boolean;
  className?: string;
  onLoad?: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const animated = src.endsWith(".gif");
  useEffect(() => {
    setError(false);
    if (!animated) return;
    const node = canvas.current;
    if (!node) return;
    const image = new Image();
    let active = true,
      frame = 0,
      previous = 0;
    image.onload = () => {
      if (!active) return;
      node.width = image.naturalWidth;
      node.height = image.naturalHeight;
      const context = node.getContext("2d");
      if (!context) {
        setError(true);
        return;
      }
      context.drawImage(image, 0, 0);
      onLoad?.();
      const draw = (now: number) => {
        frame = requestAnimationFrame(draw);
        if (!pausedRef.current && !document.hidden && now - previous > 80) {
          context.drawImage(image, 0, 0);
          previous = now;
        }
      };
      frame = requestAnimationFrame(draw);
    };
    image.onerror = () => {
      if (active) setError(true);
    };
    image.src = src;
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      image.onload = null;
      image.onerror = null;
      image.src = "";
    };
  }, [src, animated, retry]);
  return (
    <>
      {error ? (
        <div className="gallery-image-error" role="status">
          <span>No se pudo cargar la imagen.</span>
          <button
            onClick={() => {
              setError(false);
              setRetry((n) => n + 1);
            }}
          >
            Reintentar
          </button>
        </div>
      ) : animated ? (
        <canvas
          ref={canvas}
          role={alt ? "img" : undefined}
          aria-hidden={!alt}
          aria-label={alt || undefined}
          className={className}
        />
      ) : (
        <img
          key={`${src}:${retry}`}
          src={src}
          alt={alt}
          className={className}
          onLoad={onLoad}
          onError={() => setError(true)}
          decoding="async"
        />
      )}
    </>
  );
}
