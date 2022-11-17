const { default: Web3 } = require('web3')

const psp = artifacts.require("./psp.sol")

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('psp',([deployer,author,tipper])=>{
    let Psp
    before(async()=>{
        Psp=await psp.deployed()
    })

    describe('deployment',async()=>{
        it('deploys successfully',async()=>{
            const address = await Psp.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })
        it('has a name',async()=>{
            const name = await Psp.name()
            assert.equal(name, 'shiv naren')
        })
    })

    describe('posts',async()=>{
        let result,postCount
        before(async()=>{
            result= await Psp.createPost('This is patient nithish',{from:author})
            postCount= await Psp.postCount()

        })
        
        
        it('creates posts',async()=>{


                assert.equal(postCount,1)
                const event = result.logs[0].args
                assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
                assert.equal(event.content, 'This is patient nithish', 'content is correct')
                assert.equal(event.tipAmount, '0', 'tip amount is correct')
                assert.equal(event.author, author, 'author is correct')
        
                await Psp.createPost('', { from: author }).should.be.rejected;
            })

        it('lists posts',async()=>{
            const post= await Psp.posts(postCount)
            assert.equal(post.id.toNumber(), postCount.toNumber(), 'id is correct')
            assert.equal(post.content, 'This is patient nithish', 'content is correct')
            assert.equal(post.tipAmount, '0', 'tip amount is correct')
            assert.equal(post.author, author, 'author is correct')
        })
        it('allows users to tip posts',async()=>{
            let oldAuthorBalance
            oldAuthorBalance = await web3.eth.getBalance(author)
            oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)            

            result= await Psp.tipPost(postCount,{from:tipper, value: web3.utils.toWei('1','Ether')})
            
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
            assert.equal(event.content, 'This is patient nithish', 'content is correct')
            assert.equal(event.tipAmount, '1000000000000000000', 'tip amount is correct')
            assert.equal(event.author, author, 'author is correct')

            let newAuthorBalance
            newAuthorBalance = await web3.eth.getBalance(author)
            newAuthorBalance = new web3.utils.BN(newAuthorBalance)   

            let tipAmount
            tipAmount= web3.utils.toWei('1','Ether')
            tipAmount= new web3.utils.BN(tipAmount)

            const exepectedBalance = oldAuthorBalance.add(tipAmount)
            assert.equal(newAuthorBalance.toString(), exepectedBalance.toString())

            await Psp.tipPost(99,{from:tipper, value: web3.utils.toWei('1','Ether')}).should.be.rejected;            
        })
    })



})