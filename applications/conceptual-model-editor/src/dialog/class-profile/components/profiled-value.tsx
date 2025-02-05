import { SelectEntity } from "../../class/components/select-entity";
import { EntityRepresentative } from "../../utilities/dialog-utilities";
import { OverrideCheckbox } from "./checkbox-override";

/**
 * Wrap value edit with ability to select value from a profile.
 */
export function ProfiledValue<ProfileType extends EntityRepresentative>(props: {
  children: React.ReactNode,
  language: string,
  // Profiles user can select from.
  availableProfiles: ProfileType[],
  // Current profile or null.
  profile: ProfileType | null,
  onChangeProfile: (value: ProfileType) => void,
  // When true, profile options are hidden.
  hideProfiling?: boolean,
  //
  override: boolean,
  onToggleOverride: () => void,
}) {
  if (props.hideProfiling === true) {
    // We just show the input node.
    return (
      <div className="flex">
        {props.children}
      </div>
    );
  }

  const hideProfileSelector =
    // We are changing the value in the profile.
    props.override ||
    // There is only one option, no reason to show this to the user.
    props.availableProfiles.length == 1;

  return (
    <div className="flex">
      {/* Value input node. */}
      {props.children}
      <div>
        <OverrideCheckbox
          value={props.override}
          onToggle={props.onToggleOverride}
        />
        {/* Profile selector, we also hide when no value is selected. */}
        {hideProfileSelector || props.profile === null ? null : (
          <SelectEntity
            language={props.language}
            items={props.availableProfiles}
            value={props.profile}
            onChange={props.onChangeProfile}
          />
        )}
      </div>
    </div>
  )
}