import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useAuthStore from "@/store/useAuthStore";
import { useToast } from "@/components/ui/use-toast";
import { googleLogout } from "@react-oauth/google";
import Auth from "@/components/auth/auth";
import { PersonIcon } from "@radix-ui/react-icons";
import axios from "axios";

export const getUserFallbackHandler = (
  fullname: string | null | undefined,
): string => {
  if (!fullname) return "";

  let splittedName = fullname.split(" ");
  splittedName = splittedName.slice(0, 2).map((name) => name[0]);
  return splittedName.join(" ");
};

export default function UserAvatar() {
  const { toast } = useToast();
  const { user, clear, getIsAuthenticated } = useAuthStore();

  return (
    <>
      {getIsAuthenticated() ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="aspect-square h-[1.6rem] w-[1.6rem] rounded-full p-0"
            >
              <PersonIcon className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="mr-5 text-sm">
            <div className="justify-content flex w-full flex-row items-center gap-4">
              <Button
                style={{ width: "36px" }}
                className="flex aspect-square !h-full !w-[36px] items-center justify-center rounded-full p-0"
              >
                <Avatar>
                  <AvatarImage
                    className="rounded-full"
                    src={user?.image ?? ""}
                    crossOrigin="anonymous"
                    alt="@shadcn"
                  />
                  <AvatarFallback>
                    {getUserFallbackHandler(user?.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
              <div className="truncate">
                <div className="text-10 col-span-2 truncate">{user?.name}</div>
                <div className="truncte col-span-2 row-span-1 truncate">
                  {user?.email}
                </div>
              </div>
            </div>
            <div className="mt-4 grid">
              <Button
                variant="default"
                size="sm"
                onClick={async () => {
                  googleLogout();
                  clear();
                  toast({
                    title: "Byebye!",
                    description: "You already signout",
                    variant: "default",
                  });
                  await axios.post("/api/auth/signout");
                }}
              >
                Signout
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <Auth />
      )}
    </>
  );
}
