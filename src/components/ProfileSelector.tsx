import { useNavigate } from "react-router-dom";
import { Plus, User } from "lucide-react";
import { Profile } from "@/types/profile";
import { Card } from "@/components/ui/card";

interface ProfileSelectorProps {
  profiles: Profile[];
  onSelectProfile: (profileId: string) => void;
}

export const ProfileSelector = ({ profiles, onSelectProfile }: ProfileSelectorProps) => {
  const navigate = useNavigate();

  const handleProfileClick = (profileId: string) => {
    onSelectProfile(profileId);
    navigate("/");
  };

  const handleCustomizeClick = () => {
    navigate("/profile/new");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-invoice-header via-invoice-header/90 to-invoice-header/80 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl font-bold text-primary-foreground text-center mb-12">
          Who's creating an invoice?
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              onClick={() => handleProfileClick(profile.id)}
              className="group cursor-pointer bg-background/10 backdrop-blur border-2 border-transparent hover:border-accent hover:scale-105 transition-all duration-300 p-8 text-center"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                  <User className="w-12 h-12 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-primary-foreground">
                  {profile.name}
                </h3>
                <p className="text-sm text-primary-foreground/70">
                  {profile.companyDetails.companyName}
                </p>
              </div>
            </Card>
          ))}

          <Card
            onClick={handleCustomizeClick}
            className="group cursor-pointer bg-background/10 backdrop-blur border-2 border-dashed border-accent/50 hover:border-accent hover:scale-105 transition-all duration-300 p-8 text-center"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                <Plus className="w-12 h-12 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary-foreground">
                Customize Your Profile
              </h3>
              <p className="text-sm text-primary-foreground/70">
                Create or edit profile details
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
