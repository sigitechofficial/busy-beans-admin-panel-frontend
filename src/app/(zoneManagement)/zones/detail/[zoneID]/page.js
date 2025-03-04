"use client";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import ManagementTab from "@/components/ui/ManagementTab";
import CityCard from "@/components/ui/CityCard";
import ZoneEditTab from "@/components/ui/ZoneEditTab";

export default function ZoneDetail() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Zones Detail
          </h2>

          <Select
            placeholder="Filters"
            className="w-40"
            styles={selectStyles}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <ManagementTab title="Germany" />
        <ManagementTab title="Total Zones" desc="12" />
        <ManagementTab title="Total Cities" desc="28" />
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <ZoneEditTab name="Zone 01" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-4">
            <CityCard name="Berlin" />
            <CityCard name="Munich" />
            <CityCard name="Frankfurt" />
            <CityCard name="Heidelberg" />
            <CityCard name="Chemnitz" />
            <CityCard name="Berlin" />
            <CityCard name="Munich" />
            <CityCard name="Frankfurt" />
            <CityCard name="Heidelberg" />
            <CityCard name="Chemnitz" />
            <CityCard name="Berlin" />
            <CityCard name="Munich" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <ZoneEditTab name="Zone 02" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-4">
            <CityCard name="Berlin" />
            <CityCard name="Munich" />
            <CityCard name="Frankfurt" />
            <CityCard name="Heidelberg" />
            <CityCard name="Chemnitz" />
          </div>
        </div>
      </div>
    </div>
  );
}
