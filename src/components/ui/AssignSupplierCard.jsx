export default function AssignSupplierCard(props) {
  const { name, email, phoneNo } = props;
  
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-x-4">
        <div className="bg-profilePhoto size-16 rounded-full"></div>
        <div className="font-inter space-y-0.5">
          <p className="font-medium text-black">{name}</p>
          <p className="font-normal text-black/50 text-sm">{email}</p>
          <p className="font-normal text-black/50 text-sm">{phoneNo}</p>
        </div>
      </div>
      <div>
        <input type="radio" name="" id="" className="size-6" />
      </div>
    </div>
  );
}
