+++ 
title = "Perudo: a game of probablity and bluffing" 
date = "2021-12-30T13:22:17+01:00" 
author = "Chun Heung Wong"
cover = "" 
tags = ["Perudo", "Probability"] 
keywords = ["", ""] 
description = "" 
showFullContent = false
readingTime = true 
draft = true
+++

# What is Perudo?
In the past year I have been part of many games of [Perudo](https://en.wikipedia.org/wiki/Dudo), a game of dice apparently of South-American origin. During the game, I kept wondering what the probabilities were for different bids in the game, and with my classes in probability a long forgotten memory, I decided to dive into the mathematical part of the game some more. 

The rules can be found on the [Wikipedia](https://en.wikipedia.org/wiki/Dudo):
> Each player starts having five dice and a cup, which is used for shaking the dice and concealing the dice from the other players. Players roll die in order, to determine where and in what order they sit. Highest first, then next lowest and so on. In the event of a tie between 2 players, they simply re-roll until one gains a higher score. 
> 
> After deciding who starts the game (this can be done by making each player roll one die, for example), the players shake their dice in their cups, and then each player looks at their own dice, keeping their dice concealed from other players. Then, the first player makes a bid about how many dice of a certain value are showing among all players, at a minimum. Aces (dice showing a one) are wild, meaning that they count as every number. For example, a bid of "five threes" is a claim that between all players, there are at least five dice showing a three or an ace. The player challenges the next player (moving clockwise) to raise the bid or call dudo to end the round.
> 
> *Raise*: also known as "bid" in most versions, a player can increase the quantity of dice (e.g. from "five threes" to "six threes") or the die number (e.g. "five threes" to "five sixes") or both. If a player increases the quantity, they can choose any number e.g. a bid may increase from "five threes" to "six twos".
> 
> *Bidding aces*: a player who wishes to bid aces can halve the quantity of dice, rounding upwards. For instance, if the current bid is "five threes" then the next player would have to bid at least three aces. If the current bid is aces, the next player can call dudo or increase the quantity (e.g. "four aces") or bid a different number, in which case the lower bound on the quantity is one more than double the previous quantity—for instance, from "three aces", a player wishing to bid fours would have to bid "seven fours" or higher.
> *Call*: also known as dudo, if the player calls, it means that they do not believe the previous bid was correct. All dice are then shown and, if the guess is not correct, the previous player (the player who made the bid) loses a die. If it is correct, the player who called loses a die. A player with no dice remaining is eliminated from the game.[1] After calling, a new round starts with the player that lost a die making the first bid, or (if that player was eliminated) the player to that player's left.[1]
>
> *Spot on*: also known as "calza" in some versions, the player claims that the previous bidder's bid is exactly right. If the number is higher or lower, the claimant loses the round; otherwise, the bidder loses the round. A "spot-on" claim typically has a lower chance of being correct than a challenge, so a correct "spot on" call sometimes has a greater reward, such as the player regaining a previously lost die.
When a player first reaches one die (i.e. loses a round and goes from two dice to one), a Palifico round is played. During this round, the player makes an opening bid and their choice of die number cannot be changed. Aces are not wild during the round. For instance, the player who is down to one die may bid "two fours", and the next player's only options are to raise the quantity (to "three fours" or higher), or to call.
>
> The game ends when only one player has dice remaining; that player is the winner.

# Dice-throw probabilities
Discrete probability statistics

| Variable | Description |
| --- | --- |
| {{<equation src="O">}} | Total number of outcomes |
| {{<equation src="n">}} | Number of dice |
| {{<equation src="k">}} | Number of successes (i.e. number of stated in bid or guess) |
| {{<equation src="X">}} | Random Variable (i.e. outcome of the throw) |
| {{<equation src="p">}} | Succes rate of throw | 

{{<equation src="N = 6^D" position="center">}}



[Binomial theorem](https://en.wikipedia.org/wiki/Binomial_distribution)

{{<equation src="Pr(X = k) = {n \choose k} p^k (1-p)^{n-k}">}}

where {{<equation src="p=2/6">}} for the number 2-6 to include the effect of the wild aces (1's), and {{<equation src="p=1/6">}} for the aces themselves. For a *palifico* round, {{<equation src="p=1/6">}} holds for all numbers 1-6 instead.