import { Image } from "@/components/ui/image";

type ServiceFeatureImageProps = {
	src: string;
	alt: string;
	aspectRatio?: string;
	sizes?: string;
	className?: string;
};

export function ServiceFeatureImage({
	src,
	alt,
	aspectRatio = "16/9",
	sizes = "(max-width: 1024px) 100vw, 70vw",
	className,
}: ServiceFeatureImageProps) {
	return (
		<Image
			src={src}
			alt={alt}
			aspectRatio={aspectRatio}
			framed
			sizes={sizes}
			className={className}
			imageClassName="brightness-[0.85] contrast-[1.1] saturate-[0.72]"
		/>
	);
}
