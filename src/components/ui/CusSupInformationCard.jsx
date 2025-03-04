export default function CusSupInformationCard(props) {
  const { heading, name, email, phoneNo, subHeading, subHeadingData } = props;
  return (
    <div className="py-4 px-8 space-y-4 font-inter border border-borderColor bg-white shadow-tableShadow rounded-sm">
      <p className="font-semibold text-xl">{heading}</p>
      <div className="space-y-2">
        <div className="space-y-2">
          <div>
            <div className="rounded-full bg-profilePhoto size-16"></div>
          </div>
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-black text-opacity-50">{email}</p>
            <p className="text-black text-opacity-50">{phoneNo}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-semibold text-lg underline">{subHeading}</p>
          <div className="space-y-0.5">
            {Object.entries(subHeadingData)?.map(([key, value]) => (
              <p key={key} className="flex">
                <span className="font-medium w-1/3">{key}:</span>
                <span className="text-black text-opacity-60 w-2/3 ps-5">
                  {value}
                </span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
