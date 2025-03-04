export default function CityCard(props) {
  const { name } = props;
  return (
    <div className="p-4 border border-tabBorderColor rounded-lg font-inter font-semibold text-xl">
      {name}
    </div>
  );
}
