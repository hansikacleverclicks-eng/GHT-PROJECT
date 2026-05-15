import VendorsManager from './VendorsManager';

export default function EventPlannersManager() {
  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
        Showing vendors filtered to <strong>Event Planners</strong> category only. To manage all vendors, go to the Vendors section.
      </div>
      <VendorsManager categoryFilter="Event Planners" />
    </div>
  );
}
