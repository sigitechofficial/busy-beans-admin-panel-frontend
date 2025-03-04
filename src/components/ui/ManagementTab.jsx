export default function ManagementTab(props) {
  const { title, desc } = props;
  return (
    <div className="p-5 space-y-8 font-inter font-medium text-lg bg-themeTab border border-tabBorderColor shadow-tabShadow rounded-xl">
      <p>{title}</p>
      <p>{desc}</p>
    </div>
  );
}
