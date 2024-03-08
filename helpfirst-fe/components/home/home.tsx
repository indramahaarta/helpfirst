/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  useLoadScript,
  GoogleMap,
  MarkerF,
  CircleF,
  InfoWindow,
} from "@react-google-maps/api";
import { FC, useEffect, useMemo, useState } from "react";
import ReportForm from "./components/report-form";
import { Button } from "../ui/button";
import useAuthStore from "@/store/useAuthStore";
import { useToast } from "../ui/use-toast";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import axios from "axios";
import { ReportResponse } from "@/model/model";

export interface GeoLocation {
  lat: number;
  lng: number;
}

const libraries = ["places"];

const Home: FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportResponse | null>(
    null
  );
  const [report, setReport] = useState<ReportResponse[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const { toast } = useToast();
  const [showClickedMark, _setShowClickedMark] = useState<boolean>(false);
  const [userLocationClicked, setUserLocationClicked] =
    useState<boolean>(false);
  const [curLocation, setCurLocation] = useState<GeoLocation>({
    lat: 0.1,
    lng: 0.1,
  });
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [clickedLocation, setClickedlocation] = useState<GeoLocation>({
    lat: 0.1,
    lng: 0.1,
  });
  const [mapFocusPoint, setMapFocusPoint] = useState<GeoLocation>({
    lat: 0.1,
    lng: 0.1,
  });

  const [address, setAddress] = useState<string>("");

  const mapCenter = useMemo(
    () => ({ lat: curLocation?.lat, lng: curLocation?.lng }),
    [curLocation?.lat, curLocation?.lng]
  );
  const { getIsAuthenticated } = useAuthStore();

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: false,
      clickableIcons: true,
      scrollwheel: true,
    }),
    []
  );

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setMapFocusPoint({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {}
      );
    }
  }, []);

  const getReport = async () => {
    setIsLoadingReport(true);
    try {
      const {
        data: { report },
      }: { data: { report: ReportResponse[] } } = await axios.get(
        `/api/report?lat=${mapFocusPoint.lat}&lng=${mapFocusPoint.lng}`
      );
      setReport(report);
    } catch {
      toast({
        title: "Error",
        description: "failed to fetch data in this location",
        variant: "destructive",
      });
    }
    setIsLoadingReport(false);
  };

  useEffect(() => {
    getReport();
  }, [mapFocusPoint]);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string,
    libraries: libraries as any,
  });

  if (!isLoaded) {
    return (
      <div className="w-full h-[calc(100vh-64px)] flex justify-center items-center">
        <div
          className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        />
        <span>Loading Maps...</span>
      </div>
    );
  }

  const mapOnClickHandler = (e: google.maps.MapMouseEvent) => {
    const latLng = {
      lat: e.latLng?.lat() || 0.1,
      lng: e.latLng?.lng() || 0.1,
    };
    triggerNeedHelpForm(latLng);
  };

  const needHelpButtonClickedHandler = () => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        triggerNeedHelpForm({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      () => {}
    );
  };

  const triggerNeedHelpForm = (latLng: GeoLocation) => {
    const geocoder = new google.maps.Geocoder();
    setClickedlocation(latLng);
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        setAddress(results?.[0].formatted_address);
        if (getIsAuthenticated()) {
          document.getElementById("report-form-trigger-btn")?.click();
        } else {
          toast({
            title: "Error",
            description: "you need to login first",
            variant: "destructive",
          });
          document.getElementById("dialog-auth-btn")?.click();
        }
      } else {
        setAddress("");
      }
    });
  };

  return (
    <div className="w-full h-[calc(100vh-64px)]">
      <GoogleMap
        options={mapOptions}
        zoom={14}
        onLoad={(map) => {
          setMap(map);
        }}
        center={mapCenter}
        mapTypeId={google.maps.MapTypeId.ROADMAP}
        mapContainerStyle={{ width: "100%", height: "100%" }}
        onClick={(e) => mapOnClickHandler(e)}
        onDragEnd={() => {
          const newCenter = map?.getCenter();
          setMapFocusPoint({
            lat: newCenter?.lat() ?? curLocation.lat,
            lng: newCenter?.lng() ?? curLocation.lng,
          });
        }}
      >
        <MarkerF
          onClick={() => setUserLocationClicked(true)}
          position={mapCenter}
        />
        {[20, 100].map((radius, idx) => {
          return (
            <CircleF
              key={idx}
              center={{
                lat: curLocation?.lat ?? 0.1,
                lng: curLocation?.lng ?? 0.1,
              }}
              radius={radius}
              options={{
                fillColor: "green",
                strokeColor: "green",
                strokeOpacity: 0.8,
              }}
            />
          );
        })}
        {userLocationClicked && (
          <InfoWindow
            position={{ lat: curLocation.lat, lng: curLocation.lng }}
            onCloseClick={() => {
              setUserLocationClicked(false);
            }}
          >
            <div>You are here</div>
          </InfoWindow>
        )}

        {showClickedMark && (
          <>
            <MarkerF
              clickable
              position={{
                lat: clickedLocation?.lat ?? 0.1,
                lng: clickedLocation?.lng ?? 0.1,
              }}
            />
          </>
        )}

        {report?.map((report) => (
          <div
            key={report.id}
            onClick={() => {
              if (map) {
                map.panTo({ lat: report.lat, lng: report.lng });
              }
            }}
          >
            <MarkerF
              onClick={() => {
                setSelectedReport(report);
              }}
              position={{ lat: report.lat, lng: report.lng }}
            />
            {[100, 300].map((radius, idx) => {
              return (
                <CircleF
                  key={idx}
                  center={{
                    lat: report?.lat ?? 0.1,
                    lng: report?.lng ?? 0.1,
                  }}
                  radius={radius}
                  options={{
                    fillColor:
                      radius > 100
                        ? report.level === "Low"
                          ? "#FFFF00DD"
                          : report.level === "Medium"
                          ? "#FFA500DD"
                          : report.level === "High"
                          ? "#FF5733DD"
                          : "green"
                        : report.level === "Low"
                        ? "#FFFF00"
                        : report.level === "Medium"
                        ? "#FFA500"
                        : report.level === "High"
                        ? "#FF5733"
                        : "green",
                    strokeColor:
                      radius > 100
                        ? report.level === "Low"
                          ? "#FFFF00DD"
                          : report.level === "Medium"
                          ? "#FFA500DD"
                          : report.level === "High"
                          ? "#FF5733DD"
                          : "green"
                        : report.level === "Low"
                        ? "#FFFF00"
                        : report.level === "Medium"
                        ? "#FFA500"
                        : report.level === "High"
                        ? "#FF5733"
                        : "green",
                    strokeOpacity: 0.8,
                  }}
                />
              );
            })}
          </div>
        ))}
        {selectedReport && (
          <InfoWindow
            position={{ lat: selectedReport.lat, lng: selectedReport.lng }}
            onCloseClick={() => {
              setSelectedReport(null);
            }}
          >
            <div className="max-w-[300px]">
              <h3 className="text-lg font-bold">{selectedReport.title}</h3>
              <div className="text-sm">
                <div className="grid grid-cols-3">
                  <p className="col-span-1">Type</p>
                  <p className="col-span-2">{selectedReport.type}</p>
                </div>
                <div className="grid grid-cols-3">
                  <p className="col-span-1">Level</p>
                  <p className="col-span-2">{selectedReport.level}</p>
                </div>
                <div className="grid grid-cols-3">
                  <p className="col-span-1">Address</p>
                  <p className="col-span-2">{selectedReport.address}</p>
                </div>
                <div className="grid grid-cols-3">
                  <p className="col-span-1">Latitude</p>
                  <p className="col-span-2">{selectedReport.lat}</p>
                </div>
                <div className="grid grid-cols-3">
                  <p className="col-span-1">Longitude</p>
                  <p className="col-span-2">{selectedReport.lng}</p>
                </div>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        {isLoadingReport && (
          <div className="w-full mb-2 flex justify-center items-center">
            <div
              className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status"
            />
            <span>Loading Rport...</span>
          </div>
        )}
        <Button size="lg" onClick={() => needHelpButtonClickedHandler()}>
          Need Help?
        </Button>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="hidden" id="report-form-trigger-btn" />
        </DialogTrigger>
        <ReportForm
          onSubmit={setReport}
          onClose={() => {}}
          location={clickedLocation as GeoLocation}
          address={address}
        />
      </Dialog>
    </div>
  );
};

Home.displayName = "Home";
export default Home;
