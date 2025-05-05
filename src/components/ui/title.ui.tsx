interface TitleUIProps {
  text: string;
  className?: string;
}

export default function TitleUI({ text, className }: TitleUIProps) {
  return <h2 className={`text-2xl text-center ${className || ""}`}>{text}</h2>;
}
