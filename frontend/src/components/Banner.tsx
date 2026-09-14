import "./Banner.css";

interface BannerProps {
  texto: string;
}

export function Banner({ texto }: BannerProps) {
  return (
    <div className="banner" role="note">
      {texto}
    </div>
  );
}
