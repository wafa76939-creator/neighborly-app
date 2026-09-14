const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Report = require('../models/Report');
const normalizeAddress = require('../utils/addressNormalizer');

const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const places = {
  main: { address: '124 Main Street, Springfield', lat: 40.7128, lng: -74.006 },
  pine: { address: '88 Pine Street, Springfield', lat: 40.7139, lng: -74.0081 },
  river: { address: '3 River Road, Springfield', lat: 40.7112, lng: -74.0038 },
  elm: { address: '210 Elm Court, Springfield', lat: 40.7148, lng: -74.0094 },
  birch: { address: '45 Birch Lane, Springfield', lat: 40.7104, lng: -74.0074 },
  cedar: { address: '9 Cedar Way, Springfield', lat: 40.7156, lng: -74.0049 },
  maple: { address: '72 Maple Drive, Springfield', lat: 40.7131, lng: -74.0027 },
};

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});
  await Report.deleteMany({});

  const passwordHash = await bcrypt.hash('Demo123!', 10);
  const [maya, alex, jordan, sam, casey, riley] = await User.insertMany([
    { name: 'Maya Chen', email: 'demo@neighborly.com', passwordHash },
    { name: 'Alex Rivera', email: 'alex@neighborly.com', passwordHash },
    { name: 'Jordan Lee', email: 'jordan@neighborly.com', passwordHash },
    { name: 'Sam Patel', email: 'sam@neighborly.com', passwordHash },
    { name: 'Casey Nguyen', email: 'casey@neighborly.com', passwordHash },
    { name: 'Riley Brooks', email: 'riley@neighborly.com', passwordHash },
  ]);

  const makeReport = ({
    place,
    user,
    title,
    description,
    category,
    days,
    status = 'open',
    upvoters = [],
    comments = [],
  }) => ({
    title,
    description,
    category,
    address: place.address,
    normalizedAddress: normalizeAddress(place.address),
    location: { lat: place.lat, lng: place.lng },
    occurredAt: daysAgo(days),
    createdAt: daysAgo(days),
    reportedBy: user._id,
    status,
    upvotes: upvoters.map((u) => u._id),
    comments: comments.map((c) => ({
      userId: c.user._id,
      text: c.text,
      createdAt: daysAgo(c.days ?? days),
    })),
  });

  const reports = [
    makeReport({
      place: places.main,
      user: maya,
      title: 'Late-night bass from unit 3B',
      description: 'The subwoofer starts after midnight and rattles the windows. It has happened four weekends in a row.',
      category: 'Noise',
      days: 1,
      upvoters: [alex, jordan, sam, casey],
      comments: [{ user: jordan, text: 'Heard it from two floors up around 12:40am.', days: 1 }],
    }),
    makeReport({
      place: places.main,
      user: alex,
      title: 'Party noise past 2am',
      description: 'Crowds in the courtyard with speakers pointed toward the street.',
      category: 'Noise',
      days: 3,
      upvoters: [maya, sam],
    }),
    makeReport({
      place: places.main,
      user: jordan,
      title: 'Motorcycle revving in the alley',
      description: 'Someone is doing laps behind the building after 1am.',
      category: 'Noise',
      days: 5,
      upvoters: [maya, casey],
    }),
    makeReport({
      place: places.main,
      user: sam,
      title: 'Construction starting before 6am',
      description: 'Drills and hammering well before permitted hours.',
      category: 'Noise',
      days: 7,
      upvoters: [alex],
    }),
    makeReport({
      place: places.main,
      user: casey,
      title: 'Karaoke spilling onto Main',
      description: 'Open windows, no volume control, three nights this week.',
      category: 'Noise',
      days: 9,
      upvoters: [maya, jordan],
    }),
    makeReport({
      place: places.main,
      user: riley,
      title: 'Blocked fire lane overnight',
      description: 'Delivery van parked across the hydrant again.',
      category: 'Parking',
      days: 11,
      status: 'acknowledged',
      upvoters: [sam],
    }),
    makeReport({
      place: places.main,
      user: maya,
      title: 'Subwoofer through the floor',
      description: 'Continuous low rumble from the unit below after 11pm.',
      category: 'Noise',
      days: 13,
      upvoters: [alex, jordan, riley],
    }),
    makeReport({
      place: places.main,
      user: alex,
      title: 'Friday night crowd in the stairwell',
      description: 'People gathering and shouting between floors until 3am.',
      category: 'Noise',
      days: 16,
      upvoters: [maya],
    }),
    makeReport({
      place: places.main,
      user: jordan,
      title: 'Idling trucks at dawn',
      description: 'Refrigerated trucks left running on Main for over an hour.',
      category: 'Noise',
      days: 18,
      upvoters: [casey, riley],
    }),
    makeReport({
      place: places.main,
      user: sam,
      title: 'Amplifier practice on weeknights',
      description: 'Live guitar through an amp, no closed windows, every other night.',
      category: 'Noise',
      days: 21,
      upvoters: [maya, alex],
    }),
    makeReport({
      place: places.main,
      user: casey,
      title: 'Shouting match on the stoop',
      description: 'Loud argument lasting 40 minutes. Several neighbors came outside.',
      category: 'Noise',
      days: 24,
      upvoters: [jordan],
    }),
    makeReport({
      place: places.main,
      user: riley,
      title: 'Bass leaking from the bar',
      description: 'The corner bar keeps the door open. Sound carries down the block.',
      category: 'Noise',
      days: 27,
      upvoters: [maya, sam, alex],
    }),
    makeReport({
      place: places.main,
      user: maya,
      title: 'Older noise complaint from last month',
      description: 'Same unit, same hours. This has been going on longer than this month.',
      category: 'Noise',
      days: 42,
      status: 'resolved',
    }),
    makeReport({
      place: places.pine,
      user: jordan,
      title: 'Overflowing dumpster',
      description: 'Bags stacked beside the bin for four days. Smell reaches the sidewalk.',
      category: 'Trash',
      days: 4,
      upvoters: [sam, casey],
      comments: [{ user: sam, text: 'Pigeons have been tearing the bags open.', days: 3 }],
    }),
    makeReport({
      place: places.pine,
      user: sam,
      title: 'Broken streetlight on the corner',
      description: 'The lamp has been dark for a week. The intersection feels unsafe after dusk.',
      category: 'Safety',
      days: 9,
      upvoters: [jordan, riley],
    }),
    makeReport({
      place: places.pine,
      user: casey,
      title: 'Loose trash after pickup day',
      description: 'Wind scatters cardboard into the bike lane every Wednesday.',
      category: 'Trash',
      days: 19,
    }),
    makeReport({
      place: places.river,
      user: casey,
      title: 'Pothole near the driveway',
      description: 'Deep enough to scrape a bumper. Getting worse after rain.',
      category: 'Maintenance',
      days: 6,
      upvoters: [alex],
    }),
    makeReport({
      place: places.elm,
      user: alex,
      title: 'Cars parked on the sidewalk',
      description: 'Residents have to walk into the street with strollers.',
      category: 'Parking',
      days: 3,
      status: 'acknowledged',
      upvoters: [jordan, maya],
    }),
    makeReport({
      place: places.elm,
      user: jordan,
      title: 'Graffiti on the mailboxes',
      description: 'New tags appeared overnight on the cluster boxes.',
      category: 'Other',
      days: 18,
    }),
    makeReport({
      place: places.birch,
      user: riley,
      title: 'Uncollected bulk items',
      description: 'Mattress and chairs have sat on the curb for ten days.',
      category: 'Trash',
      days: 8,
      upvoters: [maya],
    }),
    makeReport({
      place: places.birch,
      user: maya,
      title: 'Dim path lights in the courtyard',
      description: 'Two fixtures are out. The path to the building door is poorly lit.',
      category: 'Safety',
      days: 14,
      upvoters: [riley, casey],
    }),
    makeReport({
      place: places.cedar,
      user: sam,
      title: 'Leaking fire hydrant',
      description: 'Water has been pooling at the curb and freezing overnight.',
      category: 'Maintenance',
      days: 12,
      status: 'resolved',
      upvoters: [alex],
    }),
    makeReport({
      place: places.maple,
      user: alex,
      title: 'Double-parked school pickup',
      description: 'Cars block the bike lane every weekday at 3pm.',
      category: 'Parking',
      days: 2,
      upvoters: [jordan, casey],
    }),
    makeReport({
      place: places.maple,
      user: jordan,
      title: 'Speeding on the downhill block',
      description: 'Cars take the slope too fast near the playground entrance.',
      category: 'Safety',
      days: 10,
      upvoters: [maya, riley],
    }),
    makeReport({
      place: places.maple,
      user: casey,
      title: 'Broken playground gate',
      description: 'The latch does not close. Kids can push it open into the street.',
      category: 'Maintenance',
      days: 15,
      status: 'acknowledged',
      upvoters: [sam],
    }),
    makeReport({
      place: places.maple,
      user: riley,
      title: 'Idling SUVs during pickup',
      description: 'Five or six engines left running for the full pickup window.',
      category: 'Parking',
      days: 22,
    }),
  ];

  await Report.insertMany(reports);

  console.log('Seed complete');
  console.log('Demo: demo@neighborly.com / Demo123!');
  console.log('Hotspot: 124 Main Street, Springfield');
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
