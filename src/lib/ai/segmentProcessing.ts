import { BoundingBox } from './inference';

/**
 * Represents a tube containing multiple segments
 */
export interface TubeGroup {
  segments: BoundingBox[];
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Configuration options for segment grouping
 */
export interface GroupingOptions {
  imageWidth: number;
  imageHeight: number;
  separationMultiplier?: number; // Multiplier for median segment width (default: 1.5)
}

/**
 * Groups detected segments into tubes based on spatial proximity (x-axis clustering)
 * 
 * Algorithm:
 * 1. Sort segments by x-coordinate (left to right)
 * 2. Calculate median segment width to determine gap threshold
 * 3. Group consecutive segments that are close together (same tube)
 * 4. Each group represents one physical tube
 * 
 * @param segments - Array of detected segment bounding boxes
 * @param options - Configuration options including image dimensions
 * @returns Array of tube groups, each containing segments
 */
export function groupSegmentsIntoTubes(
  segments: BoundingBox[],
  options: GroupingOptions
): TubeGroup[] {
  if (segments.length === 0) {
    return [];
  }

  // Sort segments by x-coordinate (left to right)
  const sortedSegments = [...segments].sort((a, b) => a.x - b.x);

  // Calculate median segment width for threshold
  const widths = sortedSegments.map(s => s.width);
  widths.sort((a, b) => a - b);
  const medianWidth = widths[Math.floor(widths.length / 2)];
  
  // Gap threshold: if segments are farther apart than this, they belong to different tubes
  const separationMultiplier = options.separationMultiplier ?? 1.5;
  const gapThreshold = medianWidth * separationMultiplier;

  console.log(`Grouping ${segments.length} segments with gap threshold: ${gapThreshold.toFixed(1)}px`);

  // Group segments
  const tubes: TubeGroup[] = [];
  let currentGroup: BoundingBox[] = [sortedSegments[0]];

  for (let i = 1; i < sortedSegments.length; i++) {
    const prevSegment = sortedSegments[i - 1];
    const currentSegment = sortedSegments[i];
    
    // Calculate horizontal gap between segments
    const gap = currentSegment.x - (prevSegment.x + prevSegment.width);

    if (gap <= gapThreshold) {
      // Same tube - add to current group
      currentGroup.push(currentSegment);
    } else {
      // New tube - save current group and start new one
      tubes.push(createTubeGroup(currentGroup));
      currentGroup = [currentSegment];
    }
  }

  // Add the last group
  if (currentGroup.length > 0) {
    tubes.push(createTubeGroup(currentGroup));
  }

  console.log(`Grouped segments into ${tubes.length} tubes`);
  tubes.forEach((tube, idx) => {
    console.log(`  Tube ${idx + 1}: ${tube.segments.length} segments, colors: [${
      tube.segments.map(s => s.className).join(', ')
    }]`);
  });

  return tubes;
}

/**
 * Creates a tube group from segments and calculates overall bounding box
 */
function createTubeGroup(segments: BoundingBox[]): TubeGroup {
  // Sort segments top to bottom (ascending y-coordinate)
  const sortedSegments = orderSegmentsTopToBottom([...segments]);

  // Calculate overall bounding box for the tube
  const minX = Math.min(...segments.map(s => s.x));
  const maxX = Math.max(...segments.map(s => s.x + s.width));
  const minY = Math.min(...segments.map(s => s.y));
  const maxY = Math.max(...segments.map(s => s.y + s.height));

  return {
    segments: sortedSegments,
    boundingBox: {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    },
  };
}

/**
 * Orders segments within a tube from top to bottom (ascending y-coordinate)
 * 
 * This matches the model training where position 0 = top, position 3 = bottom
 * In image coordinates, smaller Y values are at the top of the image
 * 
 * @param segments - Array of segments belonging to the same tube
 * @returns Sorted array of segments (top to bottom)
 */
export function orderSegmentsTopToBottom(segments: BoundingBox[]): BoundingBox[] {
  return [...segments].sort((a, b) => a.y - b.y); // Ascending y = top to bottom
}

/**
 * Maps segment class name to color palette letter (A-P)
 * 
 * @param className - Segment class name from model (e.g., 'crimson_red', 'unknown', 'empty')
 * @returns Color letter code or '?' for unknown
 */
export function segmentClassToColorLetter(className: string): string {
  const classMap: Record<string, string> = {
    'unknown': '?',
    'empty': '', // Empty segments should be filtered out
    'royal_indigo': 'A',
    'crimson_red': 'B',
    'burgundy_crimson': 'C',
    'royal_magenta': 'D',
    'burnished_bronze': 'E',
    'rose_coral': 'F',
    'sky_azure': 'G',
    'electric_violet': 'H',
    'amber_orange': 'I',
    'emerald_green': 'J',
    'forest_green': 'K',
    'lavender_blush': 'L',
    'steel_gray': 'M',
    'soft_copper': 'N',
  };

  const letter = classMap[className];
  
  if (letter === undefined) {
    console.warn(`Unknown segment class: "${className}", defaulting to '?'`);
    return '?';
  }
  
  return letter;
}

/**
 * Validates tube configuration and returns warnings if any
 * 
 * @param tubes - Array of tube groups
 * @returns Array of warning messages
 */
export function validateTubeConfiguration(tubes: TubeGroup[]): string[] {
  const warnings: string[] = [];

  if (tubes.length < 3) {
    warnings.push(`Only ${tubes.length} tube(s) detected. Expected at least 3.`);
  }

  if (tubes.length > 18) {
    warnings.push(`${tubes.length} tubes detected. Maximum supported is 18.`);
  }

  // Check for tubes with unusual segment counts
  tubes.forEach((tube, index) => {
    if (tube.segments.length === 0) {
      warnings.push(`Tube ${index + 1} has no segments`);
    } else if (tube.segments.length > 4) {
      warnings.push(`Tube ${index + 1} has ${tube.segments.length} segments (expected max 4)`);
    }
  });

  return warnings;
}
