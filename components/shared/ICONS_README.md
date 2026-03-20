# Icons Library

This directory contains reusable SVG icon components for the application.

## Files

- `icons.tsx` - Original icon components (legacy/existing icons)
- `new-icons.tsx` - New comprehensive icon library with size variants
- `ICONS_README.md` - This documentation file

## Usage

### Import Icons

```tsx
// From new-icons.tsx (recommended - has size variants)
import { SearchIcon, HomeIcon, UserIcon } from "@/components/shared/new-icons"

// From icons.tsx (legacy)
import { ShoppingCartIcon, MagniferIcon } from "@/components/shared/icons"
```

### Basic Usage

```tsx
// Default size
<SearchIcon />

// With size variant
<SearchIcon size="sm" />
<SearchIcon size="lg" />

// With custom className
<SearchIcon className="text-primary" />

// With custom stroke width
<SearchIcon strokeWidth={1.5} />

// With custom color (via className or style)
<SearchIcon className="text-red-500" />
<SearchIcon style={{ color: 'red' }} />
```

## Size Variants (new-icons.tsx)

| Size    | Class     | Pixels |
|---------|-----------|--------|
| `xs`    | `size-6`  | 24px   |
| `sm`    | `size-8`  | 32px   |
| `md`    | `size-10` | 40px   |
| `lg`    | `size-12` | 48px   |
| `xl`    | `size-14` | 56px   |

## Icon Categories

### Navigation
- `SearchIcon`, `HomeIcon`, `MenuIcon`, `XIcon`
- `ChevronLeftIcon`, `ChevronRightIcon`, `ChevronUpIcon`, `ChevronDownIcon`
- `ArrowLeftIcon`, `ArrowRightIcon`, `ArrowUpIcon`, `ArrowDownIcon`

### Actions
- `PlusIcon`, `MinusIcon`, `EditIcon`, `TrashIcon`
- `CopyIcon`, `CheckIcon`, `XCircleIcon`, `CheckCircleIcon`
- `AlertCircleIcon`, `InfoIcon`

### UI
- `SettingsIcon`, `BellIcon`, `CalendarIcon`, `ClockIcon`
- `ExternalLinkIcon`, `LinkIcon`, `DownloadIcon`, `UploadIcon`
- `ShareIcon`, `MoreHorizontalIcon`, `MoreVerticalIcon`

### Commerce
- `ShoppingCartIcon`, `CreditCardIcon`, `PackageIcon`
- `TagIcon`, `WalletIcon`

### Communication
- `MailIcon`, `PhoneIcon`, `MessageSquareIcon`, `MessageCircleIcon`
- `SendIcon`

### Media
- `ImageIcon`, `VideoIcon`, `PlayIcon`, `PauseIcon`
- `VolumeIcon`, `VolumeXIcon`, `MicIcon`, `MicOffIcon`, `CameraIcon`

### Files
- `FileIcon`, `FileTextIcon`, `FolderIcon`, `FolderOpenIcon`
- `BookmarkIcon`

### Social
- `GithubIcon`, `TwitterIcon`, `FacebookIcon`, `InstagramIcon`
- `LinkedinIcon`, `YoutubeIcon`, `WhatsappIcon`

### Weather
- `SunIcon`, `MoonIcon`, `CloudIcon`, `CloudRainIcon`
- `CloudSnowIcon`, `LightningIcon`

### User & Auth
- `UserIcon`, `UsersIcon`, `LogOutIcon`, `LogInIcon`
- `UserPlusIcon`, `UserMinusIcon`

### Security
- `LockIcon`, `UnlockIcon`, `KeyIcon`, `ShieldIcon`, `ShieldCheckIcon`

### Location
- `MapPinIcon`, `MapIcon`, `NavigationIcon`, `CompassIcon`, `GlobeIcon`

### Rating & Feedback
- `StarIcon`, `StarHalfIcon`, `HeartIcon`, `HeartOffIcon`
- `ThumbsUpIcon`, `ThumbsDownIcon`
- `FrownIcon`, `MehIcon`, `SmileIcon`

### Loading & Status
- `LoaderIcon`, `LoaderCircleIcon`, `RefreshIcon`
- `RotateCwIcon`, `RotateCcwIcon`, `ZapIcon`, `SparklesIcon`

### Visibility
- `EyeIcon`, `EyeOffIcon`, `MaximizeIcon`, `MinimizeIcon`
- `ExpandIcon`, `ShrinkIcon`

### Filter & Sort
- `FilterIcon`, `SlidersHorizontalIcon`, `ListIcon`, `GridIcon`
- `LayoutGridIcon`, `SortAscIcon`, `SortDescIcon`

### Devices
- `SmartphoneIcon`, `LaptopIcon`, `MonitorIcon`, `TabletIcon`
- `BatteryIcon`, `BatteryFullIcon`, `WifiIcon`, `WifiOffIcon`
- `BluetoothIcon`, `UsbIcon`

### Print & Document
- `PrinterIcon`, `ScanIcon`, `QrCodeIcon`, `BarcodeIcon`

## Creating New Icons

1. Add the icon component to `new-icons.tsx`
2. Follow the existing pattern:

```tsx
export const IconName = ({
  size,
  className,
  ...props
}: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn(svgVariants({ size }), className)}
    {...props}
  >
    {/* SVG paths */}
  </svg>
)
```

3. Update this README with the new icon name in the appropriate category

## Migration from icons.tsx

The `new-icons.tsx` file is the recommended source for icons as it provides:
- ✅ Size variants (`xs`, `sm`, `md`, `lg`, `xl`)
- ✅ Consistent styling with `cn()` utility
- ✅ Better TypeScript support
- ✅ Organized categories
- ✅ Comprehensive icon set

Gradually migrate imports from `icons.tsx` to `new-icons.tsx` when equivalent icons are available.
