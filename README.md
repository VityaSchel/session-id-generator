# Session ID generator

Simple, fast and flexible session ID vanity generator tool.

![image](https://github.com/VityaSchel/session-id-generator/assets/59040542/3dece90b-6371-4591-8afb-43b93f34703d)

There are two versions: web and cli

[Visit website](https://session-id.pages.dev/) OR [Download CLI](https://github.com/VityaSchel/session-id-generator/releases)

This tool bruteforces mnemonics and looks for session IDs matching your specific pattern. The website works 100% clientside and allows you to specify how many workers you want to spawn.

All contributions, especially optimizations to src/worker.ts are welcome.

- [Session ID generator](#session-id-generator)
  - [How does it work?](#how-does-it-work)
  - [How long would it take?](#how-long-would-it-take)
  - [Other Session projects](#other-session-projects)
  - [Donate](#donate)

## How does it work?

1. Generate 16 random bytes
2. Append another 16 empty bytes
3. Use sodium's crypto_sign_seed_keypair to generate ed25519 key pair from bytes from step 2
4. Convert ed25519 keypair to x25519 public key using sodium's crypto_sign_ed25519_pk_to_curve25519
5. Prepend byte '5' to resulting bytes
6. Convert to hex and that's a Session ID
7. If it matches -> use mnemonic encoding function from Session's code on bytes from step (NOT STEP 2) converted to hex
8. Resulting string is mnemonic you can use to login into any Session client to have this vanity id

## How long would it take?

I recommend inputting 4 to 5 characters if you have a decent PC. 

You can configure how many workers to spawn (from 1 to `Math.ceil(navigator.hardwareConcurrency / 3)`) and that directly influences how many IDs per second your PC will bruteforce. But most likely your PC will limit threads to about 60%-80% of maximum allowed threads to spawn. Basically, setting 10 workers will likely get you same results as settings 7 workers.

Number of characters you inputted DOES NOT practically affect bruteforce speed. So type anything, look at "XXXX IDs/s" and compare that number to this table:

| Characters after 05 | Estimated combinations before first occurance |
| ------------------- | --------------------------------------------- |
| 1                   | 16^1 = 16                                     |
| 2                   | 16^2 = 256                                    |
| 3                   | 16^3 = 4,096                                  |
| 4                   | 16^4 = 65,536                                 |
| 5                   | 16^5 = 1,048,576                              |
| 6                   | 16^6 = 16,777,216                             |
|                     |                                               |

The probability of success on any given try is `p = 1/(16^𝑛)` where 𝑛 is the number of characters after "05". To calculate number of combinations for each probability, use this formula: `x = log(p)/log(1-(1/(16^𝑛)))` where p = 1-probability, for example for 50% probability is 0.5, so `x = log(0.5)/log(1-(1/(16^𝑛)))` and for 25% it's 0.25 so `x = log(0.75)/log(1-(1/(16^𝑛)))`.

Let's take for example that your PC is bruteforcing at speed of 30.000 IDs/second. This roughly translates to:

| Characters after "05" | Time for 50% probability (seconds) | Time for 25% probability (seconds) |
| --------------------- | ---------------------------------- | ---------------------------------- |
| 1                     | 0.00036                            | 0.00015                            |
| 2                     | 0.0059                             | 0.0025                             |
| 3                     | 0.0946                             | 0.0393                             |
| 4                     | 1.5142                             | 0.6284                             |
| 5                     | 24.227                             | 10.055                             |
| 6                     | 387.636                            | 160.883                            |
| 7                     | 6202 (1.7 hours)                   | 2574                               |
| 8                     | 99234 (27 hours)                   | 41186                              |
| 9                     | 1587757 (18 days)                  | 658978                             |
| 10                    | 25404112 (294 days)                | 10543659                           |

Which means it will only take you approx 1230075031724206522319280352718086947209874609291279074280610000 years to have at least 1% chance of bruteforcing full Session ID.

Here are some benchmarks:

Website:

| CPU or chip              | Ids/sec using max. threads |
| ------------------------ | -------------------------- |
| MacBook Pro M1 (2021)    | 50 000                     |
| 7800x3d                  | 54 000                     |
| Samsung S23 Ultra        | 15 000                     |
| iPhone 15 Pro Max        | 22 000                     |
| MacBook Air Intel (2020) | 6 600                      |
|                          |                            |

CLI:

| CPU or chip           | Ids/sec using max. threads |
| --------------------- | -------------------------- |
| MacBook Pro M1 (2021) | 70 000                     |
|                       |                            |

As you can see, **CLI is slightly faster**, but it's not significant when you bruteforce 4-5 characters, since you will spend more time installing CLI than save on this performance increase.

## Other Session projects

I recommend you checking out other cool projects made by me such as:
- [Session.js bot framework](https://github.com/sessionjs)
- [Session web client](https://github.com/VityaSchel/session-web)
- [ONS registry](https://ons.sessionbots.directory/)
- [Session Bots directory](https://github.com/vityaSchel/session-bots-directory/)

And subscribe on our [Telegram channel](https://t.me/session) for more!

## Donate

[hloth.dev/donate](https://hloth.dev/donate)