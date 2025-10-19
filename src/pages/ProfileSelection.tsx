import { useProfiles } from "@/hooks/useProfiles";
import { ProfileSelector } from "@/components/ProfileSelector";

const ProfileSelection = () => {
  const { profiles, selectProfile } = useProfiles();

  return <ProfileSelector profiles={profiles} onSelectProfile={selectProfile} />;
};

export default ProfileSelection;
